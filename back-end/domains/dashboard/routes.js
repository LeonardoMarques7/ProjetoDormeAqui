import { Router } from "express";
import { JWTVerify } from "../../ultis/jwt.js";
import { buildHostDashboardData } from "./service.js";
import { buildCleaningInspectionData } from "../cleaningInspection/service.js";

const router = Router();

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_NAME = isProduction ? "prod_auth_token" : "dev_auth_token";

router.get("/host", async (req, res) => {
  try {
    const { _id: hostId } = await JWTVerify(req, COOKIE_NAME);
    const dashboardData = await buildHostDashboardData(hostId);
    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Erro ao buscar dashboard do anfitrião:", error);
    return res.status(500).json({ message: "Erro ao carregar dashboard do anfitrião." });
  }
});

router.get("/host/overview", async (req, res) => {
  try {
    const { _id: hostId } = await JWTVerify(req, COOKIE_NAME);
    const dashboardData = await buildHostDashboardData(hostId);
    return res.status(200).json({
      overview: dashboardData.overview,
      priorityAlerts: dashboardData.priorityAlerts,
      upcomingMovements: dashboardData.upcomingMovements,
      upcomingMovementGroups: dashboardData.upcomingMovementGroups,
      calendar: dashboardData.calendar,
      charts: dashboardData.charts,
      operationalProperties: dashboardData.operationalProperties,
    });
  } catch (error) {
    console.error("Erro ao buscar visão geral do anfitrião:", error);
    return res.status(500).json({ message: "Erro ao carregar visão geral do anfitrião." });
  }
});

router.get("/host/cleaning-inspection", async (req, res) => {
  try {
    const { _id: hostId } = await JWTVerify(req, COOKIE_NAME);
    const cleaningInspection = await buildCleaningInspectionData(hostId);
    return res.status(200).json({ cleaningInspection });
  } catch (error) {
    console.error("Erro ao buscar limpeza e vistoria do anfitrião:", error);
    return res.status(500).json({ message: "Erro ao carregar limpeza e vistoria do anfitrião." });
  }
});

router.get("/host/financial", async (req, res) => {
  try {
    const { _id: hostId } = await JWTVerify(req, COOKIE_NAME);
    const dashboardData = await buildHostDashboardData(hostId);
    return res.status(200).json({ financial: dashboardData.financial });
  } catch (error) {
    console.error("Erro ao buscar financeiro do anfitrião:", error);
    return res.status(500).json({ message: "Erro ao carregar financeiro do anfitrião." });
  }
});

router.get("/host/reports", async (req, res) => {
  try {
    const { _id: hostId } = await JWTVerify(req, COOKIE_NAME);
    const dashboardData = await buildHostDashboardData(hostId);
    return res.status(200).json({ reports: dashboardData.reports });
  } catch (error) {
    console.error("Erro ao buscar relatórios do anfitrião:", error);
    return res.status(500).json({ message: "Erro ao carregar relatórios do anfitrião." });
  }
});

export default router;
