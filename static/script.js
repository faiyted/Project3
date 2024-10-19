d3.json('/csv_to_json').then(data => {
    const genderCounts = data.reduce((acc, curr) => {
      const gender = curr.Gender || 'Unknown'; // Adjust based on your dataset's column name
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});
  
    const labels = Object.keys(genderCounts);
    const values = Object.values(genderCounts);
  
    const chartData = [{
      labels: labels,
      values: values,
      type: 'pie',
      hoverinfo: 'label+percent',
      textinfo: 'value'
    }];
  
    const layout = {
      title: 'Gender Distribution',
      height: 400,
      width: 400
    };
  
    Plotly.newPlot('genderPieChart', chartData, layout);
  }).catch(error => {
    console.error('Error loading gender data:', error);
  });


// Susan-Industry Insights and the relationships with mental health, regions, and work locations
d3.json('/csv_to_json')
.then(data => {
  data = data.map(d => ({
    Industry: d.Industry || 'None',
    Mental_Health_Condition: d.Mental_Health_Condition || 'None',
    Work_Location: d.Work_Location || 'None',
    Region: d.Region || 'None',
    Value: d.Value || 1
  }));

  console.log("Initial Data:", data);
  populateFilters(data);
  renderCircularBarChart(data);

  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', () => {
      const filteredData = filterData(data);
      renderCircularBarChart(filteredData);
    });
  });
})
.catch(error => {
  console.error("Error fetching or processing the dataset:", error);
});

function populateFilters(data) {
populateDropdown('regionFilter', [...new Set(data.map(d => d.Region))]);
populateDropdown('workLocationFilter', [...new Set(data.map(d => d.Work_Location))]);
populateDropdown('healthConditionFilter', [...new Set(data.map(d => d.Mental_Health_Condition))]);
}

function populateDropdown(elementId, options) {
const dropdown = document.getElementById(elementId);
options.forEach(option => {
  const opt = document.createElement('option');
  opt.value = option;
  opt.textContent = option;
  dropdown.appendChild(opt);
});
}

function filterData(data) {
const region = document.getElementById('regionFilter').value;
const workLocation = document.getElementById('workLocationFilter').value;
const healthCondition = document.getElementById('healthConditionFilter').value;

return data.filter(d =>
  (region === '' || d.Region === region) &&
  (workLocation === '' || d.Work_Location === workLocation) &&
  (healthCondition === '' || d.Mental_Health_Condition === healthCondition)
);
}

function renderCircularBarChart(data) {
    const industries = [...new Set(data.map(d => d.Industry))];
    const values = industries.map(ind => 
      data.filter(d => d.Industry === ind).reduce((sum, d) => sum + d.Value, 0)
    );
  
    const angles = industries.map((_, i) => (i * 360) / industries.length);
    const colors = industries.map((_, i) => `hsl(${i * 40}, 70%, 50%)`);
  
    const trace = {
      type: 'barpolar',
      r: values,
      theta: angles,
      text: industries.map((ind, i) => `<b>${ind}</b><br>Value: ${values[i]}`),
      marker: {
        color: colors,
      },
      hovertemplate: '%{text}<extra></extra>',
    };
  
    const layout = {
        polar: {
          radialaxis: { 
            visible: true, 
            range: [0, Math.max(...values)], 
            layer: 'above traces', // Ensures grid lines appear above bars
            showline: true, // Show the radial lines
            gridcolor: 'rgba(0, 0, 0, 0.5)', // Adjust the grid line color for contrast
            gridwidth: 1 // Adjust grid line thickness
          },
          angularaxis: {
            tickvals: angles,
            ticktext: industries,
            tickfont: { size: 14, weight: 'bold' }
          }
        },
        margin: { t: 20, l: 20, r: 20, b: 20 },
        showlegend: false
      };
  
    Plotly.newPlot('chart', [trace], layout);
  }