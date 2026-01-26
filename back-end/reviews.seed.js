import mongoose from "mongoose";

export const reviews = [
  {
    booking: new mongoose.Types.ObjectId("69728aaac35d40f29ff6c130"),
    place: new mongoose.Types.ObjectId("694e0cf2c29f9e7c9094f6c3"),
    user: new mongoose.Types.ObjectId("6929c1597f94d3c7d787621f"),
    rating: 5,
    comment:
      "A acomodação é muito bem cuidada, limpa e exatamente como descrita no anúncio. O check-in foi simples e a estadia tranquila.",
    createdAt: new Date("2026-01-23T20:55:18.771Z"),
    updatedAt: new Date("2026-01-23T20:55:18.771Z"),
  },
  {
    booking: new mongoose.Types.ObjectId("69728aaac35d40f29ff6c131"),
    place: new mongoose.Types.ObjectId("694e0cf2c29f9e7c9094f6c4"),
    user: new mongoose.Types.ObjectId("6929be627f94d3c7d78761d4"),
    rating: 5,
    comment:
      "Lugar muito aconchegante e organizado. Tudo funcionou perfeitamente e o anfitrião foi super atencioso.",
    createdAt: new Date("2026-01-22T18:40:12.000Z"),
    updatedAt: new Date("2026-01-22T18:40:12.000Z"),
  },
  {
    booking: new mongoose.Types.ObjectId("69728aaac35d40f29ff6c132"),
    place: new mongoose.Types.ObjectId("694e0cf2c29f9e7c9094f6cc"),
    user: new mongoose.Types.ObjectId("6929c02c7f94d3c7d78761f0"),
    rating: 4,
    comment:
      "A estadia foi tranquila e confortável. Apenas senti falta de mais utensílios na cozinha.",
    createdAt: new Date("2026-01-21T14:22:09.000Z"),
    updatedAt: new Date("2026-01-21T14:22:09.000Z"),
  },
  {
    booking: new mongoose.Types.ObjectId("69728aaac35d40f29ff6c133"),
    place: new mongoose.Types.ObjectId("694e0cf2c29f9e7c9094f6cd"),
    user: new mongoose.Types.ObjectId("6929c0e57f94d3c7d787620f"),
    rating: 5,
    comment:
      "Ambiente muito bonito, limpo e bem localizado. Com certeza voltaria.",
    createdAt: new Date("2026-01-20T09:55:44.000Z"),
    updatedAt: new Date("2026-01-20T09:55:44.000Z"),
  },
  {
    booking: new mongoose.Types.ObjectId("69728aaac35d40f29ff6c134"),
    place: new mongoose.Types.ObjectId("694e0cf2c29f9e7c9094f6c0"),
    user: new mongoose.Types.ObjectId("6929c0917f94d3c7d7876201"),
    rating: 3,
    comment:
      "O local é bom e corresponde às fotos, porém houve um pequeno atraso no check-in.",
    createdAt: new Date("2026-01-19T16:11:30.000Z"),
    updatedAt: new Date("2026-01-19T16:11:30.000Z"),
  },
  {
    booking: new mongoose.Types.ObjectId("69728aaac35d40f29ff6c135"),
    place: new mongoose.Types.ObjectId("694e0cf2c29f9e7c9094f6c9"),
    user: new mongoose.Types.ObjectId("6929c1597f94d3c7d787621f"),
    rating: 5,
    comment:
      "Experiência excelente do início ao fim. Comunicação clara e espaço impecável.",
    createdAt: new Date("2026-01-18T20:03:51.000Z"),
    updatedAt: new Date("2026-01-18T20:03:51.000Z"),
  },
  {
    booking: new mongoose.Types.ObjectId("69728aaac35d40f29ff6c136"),
    place: new mongoose.Types.ObjectId("694e0cf2c29f9e7c9094f6cb"),
    user: new mongoose.Types.ObjectId("6966bd498ef914709090465c"),
    rating: 4,
    comment:
      "Hospedagem confortável e silenciosa. Ótima opção para descansar.",
    createdAt: new Date("2026-01-17T11:47:18.000Z"),
    updatedAt: new Date("2026-01-17T11:47:18.000Z"),
  },
  {
    booking: new mongoose.Types.ObjectId("69728aaac35d40f29ff6c137"),
    place: new mongoose.Types.ObjectId("694e0cf2c29f9e7c9094f6c6"),
    user: new mongoose.Types.ObjectId("6972c7b8a50222c0e8589476"),
    rating: 5,
    comment:
      "Tudo perfeito! Espaço muito bem cuidado e com ótima localização.",
    createdAt: new Date("2026-01-16T08:29:02.000Z"),
    updatedAt: new Date("2026-01-16T08:29:02.000Z"),
  },
  {
    booking: new mongoose.Types.ObjectId("69728aaac35d40f29ff6c138"),
    place: new mongoose.Types.ObjectId("694e0cf2c29f9e7c9094f6ce"),
    user: new mongoose.Types.ObjectId("696c0dbf60831b0046ef1484"),
    rating: 4,
    comment:
      "Gostei bastante da estadia. Ambiente agradável e conforme anunciado.",
    createdAt: new Date("2026-01-15T19:12:40.000Z"),
    updatedAt: new Date("2026-01-15T19:12:40.000Z"),
  }
];

