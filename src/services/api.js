import axios from "axios";

const api = axios.create({
  baseURL: "https://api.dicionario-aberto.net/",
});

export default api;