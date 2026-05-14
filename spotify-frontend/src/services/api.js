import axios from 'axios';

// Asegúrate de que el puerto coincida con tu backend (3000)
const API_URL = 'http://localhost:3000/api/analytics';

export const getSongs = async () => {
  try {
    const response = await axios.get(`${API_URL}/songs`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

export const getStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data.data[0] || {};
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {};
  }
};

export const getGenres = async () => {
  try {
    const response = await axios.get(`${API_URL}/genres?limit=10`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

export const getArtists = async () => {
  try {
    const response = await axios.get(`${API_URL}/artists?limit=10`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching artists:", error);
    return [];
  }
};