import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/users/${userId}`);
        setProfile(response.data);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setError("Perfil não encontrado");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || "Perfil não encontrado"}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Banner */}
      <div className="mb-8">
        <img
          src={profile.banner || "/default-banner.jpg"}
          alt="Banner"
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow-md p-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={profile.photo || "/default-avatar.jpg"}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
            
            {profile.bio && (
              <p className="text-gray-600 mb-4">{profile.bio}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {profile.occupation && (
                <div>
                  <p className="text-gray-500 font-semibold">Profissão</p>
                  <p className="text-gray-700">{profile.occupation}</p>
                </div>
              )}

              {profile.city && (
                <div>
                  <p className="text-gray-500 font-semibold">Cidade</p>
                  <p className="text-gray-700">{profile.city}</p>
                </div>
              )}

              {profile.pronouns && (
                <div>
                  <p className="text-gray-500 font-semibold">Pronomes</p>
                  <p className="text-gray-700">{profile.pronouns}</p>
                </div>
              )}

              {profile.phone && (
                <div>
                  <p className="text-gray-500 font-semibold">Telefone</p>
                  <p className="text-gray-700">{profile.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Member Since */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-gray-600">
          <span className="font-semibold">Membro desde:</span>{" "}
          {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
