import bcrypt from "bcrypt";
import crypto from "crypto";
import { isUuid, legacyId, prisma, publicUserShape } from "./helpers.js";

export { publicUserShape };

const AuthProvider = {
  LOCAL: "LOCAL",
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
};

function userWhereById(id) {
  return isUuid(id) ? { id } : { legacyMongoId: String(id) };
}

function defaultProfileData(input = {}) {
  return {
    photoUrl: input.photo || input.photoUrl || null,
    bannerUrl: input.banner || input.bannerUrl || null,
    bio: input.bio || null,
    phone: input.phone || null,
    city: input.city || null,
    pronouns: input.pronouns || null,
    occupation: input.occupation || null,
  };
}

function profileUpdateData(input = {}) {
  const data = {};
  if (input.photo !== undefined || input.photoUrl !== undefined) data.photoUrl = input.photo || input.photoUrl || null;
  if (input.banner !== undefined || input.bannerUrl !== undefined) data.bannerUrl = input.banner || input.bannerUrl || null;
  if (input.bio !== undefined) data.bio = input.bio || null;
  if (input.phone !== undefined) data.phone = input.phone || null;
  if (input.city !== undefined) data.city = input.city || null;
  if (input.pronouns !== undefined) data.pronouns = input.pronouns || null;
  if (input.occupation !== undefined) data.occupation = input.occupation || null;
  return data;
}

export async function resolveUserById(id) {
  const db = await prisma();
  return db.user.findFirst({
    where: userWhereById(id),
    include: { profile: true, authIdentities: true },
  });
}

export async function listUsers() {
  const db = await prisma();
  const users = await db.user.findMany({
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });
  return users.map(publicUserShape);
}

export async function getPublicUserById(id) {
  return publicUserShape(await resolveUserById(id));
}

export async function findUserByEmail(email) {
  const db = await prisma();
  return db.user.findUnique({
    where: { email: String(email).toLowerCase() },
    include: { profile: true, authIdentities: true },
  });
}

export async function createLocalUser({ name, email, password, photo, banner }) {
  const db = await prisma();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      name,
      email: String(email).toLowerCase(),
      profile: { create: defaultProfileData({ photo, banner }) },
      authIdentities: {
        create: {
          provider: AuthProvider.LOCAL,
          providerAccountId: String(email).toLowerCase(),
          passwordHash,
        },
      },
    },
    include: { profile: true, authIdentities: true },
  });
  return user;
}

export async function verifyLocalCredentials(email, password) {
  const user = await findUserByEmail(email);
  const identity = user?.authIdentities?.find((item) => item.provider === AuthProvider.LOCAL);

  if (!user || !identity?.passwordHash) {
    return null;
  }

  const valid = await bcrypt.compare(password, identity.passwordHash);
  return valid ? user : null;
}

export async function upsertOAuthUser({ provider, providerAccountId, email, name, photo }) {
  const db = await prisma();
  const normalizedEmail = String(email).toLowerCase();
  const normalizedProvider = provider === "github" ? AuthProvider.GITHUB : AuthProvider.GOOGLE;

  const existingIdentity = await db.authIdentity.findUnique({
    where: {
      provider_providerAccountId: {
        provider: normalizedProvider,
        providerAccountId: String(providerAccountId),
      },
    },
    include: { user: { include: { profile: true, authIdentities: true } } },
  });

  if (existingIdentity?.user) {
    return existingIdentity.user;
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    return db.user.update({
      where: { id: existingUser.id },
      data: {
        authIdentities: {
          create: {
            provider: normalizedProvider,
            providerAccountId: String(providerAccountId),
          },
        },
        profile: photo
          ? {
              upsert: {
                create: defaultProfileData({ photo }),
                update: { photoUrl: photo },
              },
            }
          : undefined,
      },
      include: { profile: true, authIdentities: true },
    });
  }

  return db.user.create({
    data: {
      name: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      profile: { create: defaultProfileData({ photo }) },
      authIdentities: {
        create: {
          provider: normalizedProvider,
          providerAccountId: String(providerAccountId),
        },
      },
    },
    include: { profile: true, authIdentities: true },
  });
}

export async function updateUserProfile(id, input) {
  const db = await prisma();
  const user = await resolveUserById(id);
  if (!user) return null;

  const userData = {};
  const profileData = profileUpdateData(input);
  if (input.name !== undefined) userData.name = input.name;
  if (input.email !== undefined) userData.email = String(input.email).toLowerCase();

  return db.user.update({
    where: { id: user.id },
    data: {
      ...userData,
      ...(Object.keys(profileData).length > 0
        ? {
            profile: {
              upsert: {
                create: { ...defaultProfileData(input), ...profileData },
                update: profileData,
              },
            },
          }
        : {}),
    },
    include: { profile: true },
  });
}

export async function updateUserPhoto(id, photoUrl) {
  return updateUserProfile(id, { photo: photoUrl });
}

export async function updateUserBanner(id, bannerUrl) {
  return updateUserProfile(id, { banner: bannerUrl });
}

export async function deactivateUser(id) {
  const db = await prisma();
  const user = await resolveUserById(id);
  if (!user) return null;
  await db.place.updateMany({ where: { ownerId: user.id }, data: { status: "INACTIVE" } });
  return db.user.update({
    where: { id: user.id },
    data: { deactivated: true, status: "DEACTIVATED" },
    include: { profile: true },
  });
}

export async function setPasswordResetToken(email) {
  const db = await prisma();
  const user = await findUserByEmail(email);
  if (!user) return null;
  const localIdentity = user.authIdentities.find((item) => item.provider === AuthProvider.LOCAL);
  if (!localIdentity) return null;

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expiresAt = new Date(Date.now() + 3600000);

  await db.passwordResetToken.create({
    data: {
      authIdentityId: localIdentity.id,
      tokenHash,
      expiresAt,
    },
  });

  return { user, resetToken, expiresAt };
}

export async function resetPassword(token, newPassword) {
  const db = await prisma();
  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
  const resetToken = await db.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { authIdentity: { include: { user: { include: { profile: true } } } } },
  });

  if (!resetToken) return null;

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.$transaction([
    db.authIdentity.update({
      where: { id: resetToken.authIdentityId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return resetToken.authIdentity.user;
}

export function userTokenShape(user) {
  const shaped = publicUserShape(user);
  return {
    _id: legacyId(user),
    id: user.id,
    name: user.name,
    email: user.email,
    photo: shaped.photo,
    banner: shaped.banner,
    authMethod: user.authIdentities?.[0]?.provider?.toLowerCase?.() || "local",
    role: "user",
  };
}
