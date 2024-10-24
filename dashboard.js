// styles.css
const styles = `
.dashboard {
    padding: 20px;
    font-family: Arial, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
}

.filters {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 20px;
}

select {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
}

.metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 20px;
}

.metric-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
}

.metric-card h3 {
    margin: 0 0 10px 0;
    color: #666;
}

.metric-card p {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.charts {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.chart-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    height: 400px;
}

body {
    background: #f5f5f5;
    margin: 0;
    padding: 20px;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
}
`;

class BikeSalesDashboard {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.charts = {};
    this.selectedCity = "all";
    this.selectedBrand = "all";
    this.selectedPower = "all";

    this.initializeDashboard();
  }

  async initializeDashboard() {
    // Add styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    this.createDashboardHTML();
    await this.loadData();
    this.initializeFilters();
    this.initializeCharts();
    this.updateDashboard();
  }

  createDashboardHTML() {
    const dashboard = document.createElement("div");
    dashboard.className = "dashboard";
    dashboard.innerHTML = `
            <h1>Bike Sales Dashboard</h1>
            
            <div class="filters">
                <select id="cityFilter">
                    <option value="all">All Cities</option>
                </select>
                
                <select id="brandFilter">
                    <option value="all">All Brands</option>
                </select>
                
                <select id="powerFilter">
                    <option value="all">All Powers</option>
                </select>
            </div>
            
            <div class="metrics">
                <div class="metric-card">
                    <h3>Average Price</h3>
                    <p id="averagePrice">₹0</p>
                </div>
                
                <div class="metric-card">
                    <h3>Brands we offer</h3>
                    <p id="totalBrands">0</p>
                </div>
                
                <div class="metric-card">
                    <h3>Total no. of bikes</h3>
                    <p id="totalBikes">0</p>
                </div>
            </div>
            
            <div class="charts">
                <div class="chart-container">
                    <canvas id="powerDistribution"></canvas>
                </div>
                <div class="chart-container">
                    <canvas id="ownerDistribution"></canvas>
                </div>
                <div class="chart-container">
                    <canvas id="cityBrandDistribution"></canvas>
                </div>
                <div class="chart-container">
                    <canvas id="ownersBrandDistribution"></canvas>
                </div>
                <div class="chart-container">
                    <canvas id="brandCityAreaChart"></canvas>
                </div>
            </div>
        `;

    document.body.appendChild(dashboard);
  }

  async loadData() {
    try {
      const response = await fetch("data/Used_Bikes_Mod.csv");
      const csvText = await response.text();

      const rows = csvText.split("\n");
      const headers = rows[0].split(",").map((h) => h.trim());

      this.data = rows.slice(1).map((row) => {
        const values = row.split(",");
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index]?.trim();
          return obj;
        }, {});
      });

      this.filteredData = [...this.data];
    } catch (error) {
      console.error("Error loading data:", error);
      // Sample data as fallback
      this.data = [
        {
          bike_name: "Bajaj Pulsar 150",
          price: "65000",
          city: "Mumbai",
          kms_driven: "25000",
          owner: "First",
          age: "3",
          power: "150cc",
          brand: "Bajaj",
        },
        // Add more sample data if needed
      ];
      this.filteredData = [...this.data];
    }
  }

  initializeFilters() {
    const cities = [...new Set(this.data.map((item) => item.city))];
    const brands = [...new Set(this.data.map((item) => item.brand))];
    const powers = [...new Set(this.data.map((item) => item.power))];

    this.populateDropdown("cityFilter", cities);
    this.populateDropdown("brandFilter", brands);
    this.populateDropdown("powerFilter", powers);

    document.getElementById("cityFilter").addEventListener("change", (e) => {
      this.selectedCity = e.target.value;
      this.updateDashboard();
    });

    document.getElementById("brandFilter").addEventListener("change", (e) => {
      this.selectedBrand = e.target.value;
      this.updateDashboard();
    });

    document.getElementById("powerFilter").addEventListener("change", (e) => {
      this.selectedPower = e.target.value;
      this.updateDashboard();
    });
  }

  populateDropdown(id, values) {
    const dropdown = document.getElementById(id);
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      dropdown.appendChild(option);
    });
  }

  initializeCharts() {
    // Power Distribution Pie Chart
    this.charts.powerDistribution = new Chart(
      document.getElementById("powerDistribution").getContext("2d"),
      {
        type: "pie",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Power Distribution",
            },
          },
        },
      }
    );

    // Owner Distribution Pie Chart
    this.charts.ownerDistribution = new Chart(
      document.getElementById("ownerDistribution").getContext("2d"),
      {
        type: "pie",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: ["#FF9F40", "#4BC0C0", "#36A2EB", "#FF6384"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Owner Distribution",
            },
          },
        },
      }
    );

    // City by Brand Bar Chart
    this.charts.cityBrandDistribution = new Chart(
      document.getElementById("cityBrandDistribution").getContext("2d"),
      {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            {
              label: "Number of Bikes",
              data: [],
              backgroundColor: "#36A2EB",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Cities by Brand",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      }
    );

    // Owners by Brand Stacked Bar Chart
    this.charts.ownersBrandDistribution = new Chart(
      document.getElementById("ownersBrandDistribution").getContext("2d"),
      {
        type: "bar",
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Owners by Brand",
            },
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
              beginAtZero: true,
            },
          },
        },
      }
    );

    // Brand by City Area Chart
    this.charts.brandCityAreaChart = new Chart(
      document.getElementById("brandCityAreaChart").getContext("2d"),
      {
        type: "line",
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Brand by City Distribution",
            },
            filler: {
              propagate: true,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      }
    );
  }

  updateDashboard() {
    // Filter data
    this.filteredData = this.data.filter((item) => {
      return (
        (this.selectedCity === "all" || item.city === this.selectedCity) &&
        (this.selectedBrand === "all" || item.brand === this.selectedBrand) &&
        (this.selectedPower === "all" || item.power === this.selectedPower)
      );
    });

    this.updateMetrics();
    this.updateCharts();
  }

  updateMetrics() {
    const avgPrice =
      this.filteredData.reduce((sum, item) => sum + parseFloat(item.price), 0) /
      this.filteredData.length;
    document.getElementById("averagePrice").textContent = new Intl.NumberFormat(
      "en-IN",
      { style: "currency", currency: "INR" }
    ).format(avgPrice);

    const totalBrands = new Set(this.filteredData.map((item) => item.brand))
      .size;
    document.getElementById("totalBrands").textContent = totalBrands;

    document.getElementById("totalBikes").textContent =
      this.filteredData.length;
  }

  updateCharts() {
    // Update Power Distribution
    const powerDist = this.getDistribution("power");
    this.charts.powerDistribution.data.labels = Object.keys(powerDist);
    this.charts.powerDistribution.data.datasets[0].data =
      Object.values(powerDist);
    this.charts.powerDistribution.update();

    // Update Owner Distribution
    const ownerDist = this.getDistribution("owner");
    this.charts.ownerDistribution.data.labels = Object.keys(ownerDist);
    this.charts.ownerDistribution.data.datasets[0].data =
      Object.values(ownerDist);
    this.charts.ownerDistribution.update();

    // Update City by Brand Distribution
    const cityBrandDist = this.getDistribution("brand");
    this.charts.cityBrandDistribution.data.labels = Object.keys(cityBrandDist);
    this.charts.cityBrandDistribution.data.datasets[0].data =
      Object.values(cityBrandDist);
    this.charts.cityBrandDistribution.update();

    // Update Owners by Brand Distribution
    const ownersBrandDist = this.getOwnersByBrandDistribution();
    this.charts.ownersBrandDistribution.data.labels = Object.keys(
      ownersBrandDist.brands
    );
    this.charts.ownersBrandDistribution.data.datasets = Object.keys(
      ownersBrandDist.owners
    ).map((owner, index) => ({
      label: owner,
      data: Object.values(ownersBrandDist.brands).map(
        (brand) => brand[owner] || 0
      ),
      backgroundColor: this.getColor(index),
      stack: "stack1",
    }));
    this.charts.ownersBrandDistribution.update();

    // Update Brand by City Area Chart
    const brandCityDist = this.getBrandByCityDistribution();
    this.charts.brandCityAreaChart.data.labels = Object.keys(
      brandCityDist.cities
    );
    this.charts.brandCityAreaChart.data.datasets = Object.keys(
      brandCityDist.brands
    ).map((brand, index) => ({
      label: brand,
      data: Object.values(brandCityDist.cities).map((city) => city[brand] || 0),
      backgroundColor: this.getColor(index, 0.2),
      borderColor: this.getColor(index),
      fill: true,
    }));
    this.charts.brandCityAreaChart.update();
  }

  getDistribution(key) {
    return this.filteredData.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1;
      return acc;
    }, {});
  }

  getOwnersByBrandDistribution() {
    const brands = {};
    const owners = {};

    this.filteredData.forEach((item) => {
      if (!brands[item.brand]) brands[item.brand] = {};
      if (!owners[item.owner]) owners[item.owner] = true;

      brands[item.brand][item.owner] =
        (brands[item.brand][item.owner] || 0) + 1;
    });

    return { brands, owners };
  }

  getBrandByCityDistribution() {
    const brands = {};
    const cities = {};

    this.filteredData.forEach((item) => {
      if (!brands[item.brand]) brands[item.brand] = true;
      if (!cities[item.city]) cities[item.city] = {};

      cities[item.city][item.brand] = (cities[item.city][item.brand] || 0) + 1;
    });

    return { brands, cities };
  }

  getColor(index, alpha = 1) {
    const colors = [
      `rgba(255, 99, 132, ${alpha})`, // red
      `rgba(54, 162, 235, ${alpha})`, // blue
      `rgba(255, 206, 86, ${alpha})`, // yellow
      `rgba(75, 192, 192, ${alpha})`, // green
      `rgba(153, 102, 255, ${alpha})`, // purple
      `rgba(255, 159, 64, ${alpha})`, // orange
      `rgba(199, 199, 199, ${alpha})`, // gray
      `rgba(83, 102, 255, ${alpha})`, // indigo
      `rgba(255, 99, 255, ${alpha})`, // pink
      `rgba(99, 255, 132, ${alpha})`, // lime
    ];

    return colors[index % colors.length];
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const dashboard = new BikeSalesDashboard();
});
