import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3005/api/latest");
        const json = await res.json();
        setData(json.reverse());
      } catch (e) {
        console.error("Erreur récupération BPM:", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: data.map((d) =>
      new Date(d.timestamp).toLocaleTimeString("fr-FR", { hour12: false })
    ),
    datasets: [
      {
        label: "BPM (fréquence cardiaque)",
        data: data.map((d) => d.bpm),
        borderColor: "#ff4d4f",
        backgroundColor: "rgba(255,77,79,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div style={{ width: "90%", margin: "auto", padding: "2rem" }}>
      <h1>📈 Monitoring du Bracelet</h1>
      <Line data={chartData} options={{ scales: { y: { min: 40, max: 200 } } }} />
    </div>
  );
}
