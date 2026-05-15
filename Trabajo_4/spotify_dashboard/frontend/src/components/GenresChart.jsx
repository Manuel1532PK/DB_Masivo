import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const GenresChart = ({ genres, onGenreClick }) => {
  const data = genres.map((g) => ({
    name: g.genre,
    popularidad: Math.round(g.avg_popularity),
    canciones: g.count,
  }));

  return (
    <div className="chart-container">
      <h3 className="section-title">Top Géneros por Popularidad</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" stroke="#b3b3b3" />
          <YAxis stroke="#b3b3b3" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#282828",
              border: "1px solid #1DB954",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend />
          <Bar
            dataKey="popularidad"
            fill="#1DB954"
            name="Popularidad Promedio"
            cursor="pointer"
            onClick={(data) => onGenreClick && onGenreClick(data.name)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenresChart;
