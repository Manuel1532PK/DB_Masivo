import axios from "axios";

// Base URL for the API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/analytics";

export const getSongs = async (genre = "") => {
  try {
    let url = `${API_URL}/songs?limit=6500`;
    if (genre) {
      url += `&genre=${encodeURIComponent(genre)}`;
    }
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

export const getStats = async (genre = "") => {
  try {
    let url = `${API_URL}/stats`;
    if (genre) {
      url += `?genre=${encodeURIComponent(genre)}`;
    }
    const response = await axios.get(url);
    return response.data.data || {};
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {};
  }
};

export const getGenres = async () => {
  try {
    const response = await axios.get(`${API_URL}/genres?limit=50`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

export const getArtists = async (genre = "") => {
  try {
    let url = `${API_URL}/artists?limit=10`;
    if (genre) {
      url += `&genre=${encodeURIComponent(genre)}`;
    }
    const response = await axios.get(url);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching artists:", error);
    return [];
  }
};
