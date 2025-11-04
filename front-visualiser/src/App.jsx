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
  const [alerts, setAlerts] = useState([]); // Ajout du state pour les alertes

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3030/latest");
        const json = await res.json();
        setData(json.reverse());
      } catch (e) {
        console.error("Erreur récupération BPM:", e);
      }
    };

    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://localhost:3030/alerts");
        const json = await res.json();
        setAlerts(json); // Stockage dans le state
      } catch (e) {
        console.error("Erreur récupération BPM:", e);
      }
    };

    fetchAlerts();
    fetchData();
    const interval = setInterval(fetchData, 5000);
    const alertsInterval = setInterval(fetchAlerts, 5000);
    return () => {
      clearInterval(interval);
      clearInterval(alertsInterval);
    };
  }, []);

  const chartData = {
    labels: data.map((d) =>
      new Date(d.timestamp).toLocaleTimeString("fr-FR", { hour12: false })
    ),
    datasets: [
      {
        label: "BPM (fréquence cardiaque)",
        data: data.map((d) => d.value),
        borderColor: "#ff4d4f",
        backgroundColor: "rgba(255,77,79,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
      <div className="dashboard">
        {/* Barre supérieure */}
        <header className="topbar">
          <div className="menu-icon">☰</div>
          <div className="app-title">ArchiMed</div>
          <div className="profile">
            <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="profile"
                className="profile-img"
            />
          </div>
        </header>

        {/* Contenu principal */}
        <main className="content">
          <h1 className="welcome">Bienvenue Madame Dupont 🩺</h1>

          <div className="cards-container">
            <div className="card large">
              <h2>Fréquence cardiaque</h2>
              <div className="chart-container">
                {/*<Line data={chartData} options={{ scales: { y: { min: 0, max: 80 } } }} />*/
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: false,
                          ticks: {
                            stepSize: 5,
                          },
                          suggestedMin: Math.min(...data.map((d) => d.value)) - 5,
                          suggestedMax: Math.max(...data.map((d) => d.value)) + 5,
                        },
                        x: {
                          ticks: {
                            autoSkip: true,
                            maxTicksLimit: 8,
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          display: true,
                          labels: { color: "#555", boxWidth: 15 },
                        },
                        tooltip: {
                          backgroundColor: "#fff",
                          titleColor: "#000",
                          bodyColor: "#000",
                          borderColor: "#ff4d4f",
                          borderWidth: 1,
                        },
                      },
                    }}
                />}

              </div>
            </div>

            <div className="card small">
              <h3>Oxygénation</h3>
              <p>( graphique d'oxygénation )</p>
            </div>

            <div className="card small">
              <h3>Nombre de pas</h3>
              <p>7 542 pas depuis ce matin</p>
            </div>

            <div className="card large">
              <h3>Historique des alertes</h3>
              <div className="alertContainer" style={{ maxHeight: "250px", overflowY: "auto" }}>
                {alerts.map((alert, idx) => (
                  <div className="card small" key={idx}>
                    <h3>{alert.type}</h3>
                    Valeur relevée : {alert.value} - {new Date(alert.timestamp).toLocaleDateString("fr-FR")} - {new Date(alert.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}