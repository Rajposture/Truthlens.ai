import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000",
});

export const verifyClaim = (
  claim: string
) =>
  api.post("/verify", {
    claim,
  });

export const getReports = () =>
  api.get("/reports");

export const uploadDocument = (
  formData: FormData
) =>
  api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

export const getDocuments = () =>
  api.get("/documents/list");

export const getStats = () =>
  api.get("/documents/stats");