import { Router } from "express";
import { JWTVerify } from "../../ultis/jwt.js";
import { downloadImage } from "../../ultis/imageDownloader.js";
import { __dirname } from "../../ultis/dirname.js";
import { sendToSupabase, uploadImage } from "../controller.js";
import { requireAuth } from "../middleware.js";
import { AUTH_COOKIE_NAME, isSafeRemoteImageUrl } from "../../security.js";
import {
  createPlace,
  getHostPlaces,
  getPlaceById,
  listPlaces,
  setPlaceActive,
  softDeletePlace,
  updatePlace,
} from "../../prisma/repositories/places.repository.js";

const router = Router();
const COOKIE_NAME = AUTH_COOKIE_NAME;

router.get("/", async (req, res) => {
  try {
    const placeDocs = await listPlaces(req.query);
    res.json(placeDocs);
  } catch (error) {
    console.error("Erro ao buscar acomodacoes:", error);
    res.status(500).json({ message: "Deu erro ao buscar acomodacoes", error: error.message });
  }
});

router.get("/owner", async (req, res) => {
  try {
    const { _id } = await JWTVerify(req, COOKIE_NAME);
    const placeDocs = await getHostPlaces(_id);
    res.json(placeDocs);
  } catch (error) {
    console.error("Erro ao buscar acomodacoes do usuario autenticado:", error);
    res.status(500).json({ message: "Deu erro ao encontrar as acomodacoes." });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const placeDocs = await getHostPlaces(req.params.userId);
    res.json(placeDocs);
  } catch (error) {
    console.error("Erro ao buscar acomodacoes para o usuario:", req.params.userId, error);
    res.status(500).json({ message: "Erro ao buscar acomodacoes do usuario.", error: error.message });
  }
});

router.get("/owner/:id", async (req, res) => {
  try {
    const placeDocs = await getHostPlaces(req.params.id);
    res.json(placeDocs);
  } catch (error) {
    console.error("Erro ao buscar acomodacoes para o dono:", req.params.id, error);
    res.status(500).json({ message: "Erro ao buscar acomodacoes do dono.", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const placeDoc = await getPlaceById(req.params.id, { includeOwner: true });
    if (!placeDoc) {
      return res.status(404).json({ error: "Acomodacao nao encontrada" });
    }
    res.json(placeDoc);
  } catch (error) {
    console.error("Erro ao encontrar acomodacao:", error);
    res.status(500).json({ message: "Deu erro ao encontrar a acomodacao.", error: error.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const updatedPlace = await updatePlace(req.params.id, req.user._id, req.body);
    if (!updatedPlace) {
      return res.status(404).json({ error: "Acomodacao nao encontrada" });
    }
    res.json(updatedPlace);
  } catch (error) {
    console.error("Erro ao atualizar acomodacao:", error);
    res.status(500).json({ message: "Deu erro ao atualizar a acomodacao.", error: error.message });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ error: "O campo isActive deve ser booleano." });
  }

  try {
    const updatedPlace = await setPlaceActive(req.params.id, req.user._id, isActive);
    if (!updatedPlace) {
      return res.status(404).json({ error: "Acomodacao nao encontrada" });
    }
    res.json(updatedPlace);
  } catch (error) {
    console.error("Erro ao atualizar status da acomodacao:", error);
    res.status(500).json({ error: "Erro ao atualizar status da acomodacao." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deletedPlace = await softDeletePlace(req.params.id, req.user._id);
    if (!deletedPlace) {
      return res.status(404).json({ message: "Acomodacao nao encontrada." });
    }
    res.json({ message: "Acomodacao deletada com sucesso!", deletedPlace });
  } catch (error) {
    console.error("Erro ao deletar acomodacao:", error);
    res.status(500).json({ message: "Erro ao deletar a acomodacao.", error: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const newPlaceDoc = await createPlace(req.user._id, req.body);
    if (!newPlaceDoc) {
      return res.status(404).json({ error: "Usuario proprietario nao encontrado." });
    }
    res.json(newPlaceDoc);
  } catch (error) {
    console.error("Erro ao criar acomodacao:", error);
    res.status(500).json({ message: "Deu erro ao criar novo lugar.", error: error.message });
  }
});

router.post("/upload/link", requireAuth, async (req, res) => {
  const { link } = req.body;
  const path = `${__dirname}/tmp/`;

  try {
    if (!isSafeRemoteImageUrl(link)) {
      return res.status(400).json({ error: "URL de imagem invalida." });
    }
    const { filename, fullPath, mimeType } = await downloadImage(link, path);
    const fileUrl = await sendToSupabase(filename, fullPath, mimeType);
    res.json(fileUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json("Erro ao baixar a imagem.");
  }
});

router.post("/upload", requireAuth, uploadImage().array("files", 10), async (req, res) => {
  const { files } = req;

  const filesPromisse = new Promise((resolve, reject) => {
    const fileURLArray = [];

    files.forEach(async (file) => {
      const { filename, path, mimetype } = file;
      try {
        const fileUrl = await sendToSupabase(filename, path, mimetype);
        fileURLArray.push(fileUrl);
      } catch (error) {
        console.error("Deu errado ao subir para o Supabase", error);
        reject(error);
      }
    });

    const idInterval = setInterval(() => {
      if (files.length === fileURLArray.length) {
        clearInterval(idInterval);
        resolve(fileURLArray);
      }
    }, 100);
  });

  const fileURLArrayResolve = await filesPromisse;
  res.json(fileURLArrayResolve);
});

export default router;
