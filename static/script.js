// Original code continues...
// Fetch and process the MongoDB data
d3.json('/mongo_data')
  .then(mongoData => {
    // Map MongoDB data to include all fields you might need
    const data = mongoData.map(d => ({
      Productivity_Change: d.Productivity_Change || 'None',
      Industry: d.Industry || 'None',
      Physical_Activity: d.Physical_Activity || 'None',
      Access_to_Mental_Health_Resources: d.Access_to_Mental_Health_Resources || 'None',
      Job_Role: d.Job_Role || 'None',
      Hours_Worked_Per_Week: d.Hours_Worked_Per_Week || 'None',
      Work_Location: d.Work_Location || 'None',
      Employee_ID: d.Employee_ID || 'None',
      Number_of_Virtual_Meetings: d.Number_of_Virtual_Meetings || 'None',
      Stress_Level: d.Stress_Level || 'None',
      Mental_Health_Condition: d.Mental_Health_Condition || 'None',
      _id: d._id || 'None',
      Sleep_Quality: parseInt(d.Sleep_Quality, 10) || 'None',
      Company_Support_for_Remote_Work: d.Company_Support_for_Remote_Work || 'None',
      Work_Life_Balance_Rating: d.Work_Life_Balance_Rating || 'None',
      Social_Isolation_Rating: d.Social_Isolation_Rating || 'None',
      Region: d.Region || 'None',
      Gender: d.Gender || 'None',
      Satisfaction_with_Remote_Work: d.Satisfaction_with_Remote_Work || 'None',
      Age: d.Age || 'None',
      Years_of_Experience: d.Years_of_Experience || 'None',
      Value: d.Value || 1  // Replace `Value` with the appropriate field if needed
    }));

    console.log("MongoDB Data:", data);
    populateFilters(data);  // Populate the dropdown filters
    renderCircularBarChart(data);  // Initial circular chart rendering
    renderBarChart(data);  // Initial bar chart rendering
    renderStackedBarChartForPhysicalActivity(data);
    mentalPhy(data);

    // Add event listeners to each dropdown
    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', () => {
        const filteredData = filterData(data);  // Filter data based on the selections
        renderCircularBarChart(filteredData);  // Update the circular chart with filtered data
        renderBarChart(filteredData);  // Update the bar chart with filtered data
      });
    });
  })
  .catch(error => {
    console.error("Error fetching MongoDB data:", error);
  });


// ALL OF SUSAN'S GRAPH
// Populate the dropdown filters dynamically based on the dataset
function populateFilters(data) {
  populateDropdown('regionFilter', [...new Set(data.map(d => d.Region))]);
  populateDropdown('workLocationFilter', [...new Set(data.map(d => d.Work_Location))]);
  populateDropdown('healthConditionFilter', [...new Set(data.map(d => d.Mental_Health_Condition))]);
}

// Helper to populate a dropdown by its ID
function populateDropdown(elementId, options) {
  const dropdown = document.getElementById(elementId);
  dropdown.innerHTML = '<option value="">All</option>';  // Add an "All" option
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    dropdown.appendChild(opt);
  });
}

// Filter the dataset based on the dropdown selections
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

// Render the circular bar chart using Plotly
function renderCircularBarChart(data) {
  const industries = [...new Set(data.map(d => d.Industry))];  // Get unique industries
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

// BEGINNING OF LOGANS
// MENTAL HEALTH RESOURCES AND PHYSICAL ACTIVITY BY MENTAL HEALTH CONDITION
function mentalHealthResourcesChart(data) {
    // Process data for the chart
    const conditions = [...new Set(data.map(d => d.Mental_Health_Condition))];
    const physicalActivities = [...new Set(data.map(d => d.Physical_Activity))];
    const accessLevels = [...new Set(data.map(d => d.Access_to_Mental_Health_Resources))];
    
    const chartData = [];

    // Prepare the stacked data
    conditions.forEach(condition => {
        physicalActivities.forEach(activity => {
            accessLevels.forEach(access => {
                const filteredData = data.filter(d =>
                    d.Mental_Health_Condition === condition &&
                    d.Physical_Activity === activity &&
                    d.Access_to_Mental_Health_Resources === access
                );
                chartData.push({
                    x: condition,
                    y: filteredData.length,
                    name: `${access}, ${activity}`,
                    type: 'bar',
                });
            });
        });
    });

    const layout = {
        title: 'Access to Mental Health Resources and Physical Activity by Mental Health Condition',
        barmode: 'stack',
        xaxis: { title: 'Mental Health Condition' },
        yaxis: { title: 'Percentage (%)' }
    };

    Plotly.newPlot('mental-health-chart', chartData, layout);
}

// PRODUCTIVITY CHANGE BY WORK LOCATION
function productivityChangeChart(data) {
    const workLocations = ['Remote', 'Hybrid', 'Onsite'];
    const changeTypes = ['Increase', 'Decrease', 'No Change'];
    const colors = ['#69BE28', '#FF4500', '#4682B4'];
    
    const chartData = [];

    workLocations.forEach(location => {
        changeTypes.forEach((change, i) => {
            const count = data.filter(d => d.Work_Location === location && d.Productivity_Change === change).length;
            chartData.push({
                x: location,
                y: count,
                name: change,
                type: 'bar',
                marker: { color: colors[i] },
            });
        });
    });

    const layout = {
        title: 'Productivity Change by Work Location (With Counts and Percentages)',
        barmode: 'stack',
        xaxis: { title: 'Work Location' },
        yaxis: { title: 'Number of Employees' },
    };

    Plotly.newPlot('productivity-change-chart', chartData, layout);
}

// STRESS LEVELS BY HOURS WORKED AND VIRTUAL MEETINGS
function stressLevelsChart(data) {
    const chartData = {
        x: data.map(d => d.Hours_Worked_Per_Week),
        y: data.map(d => d.Number_of_Virtual_Meetings),
        z: data.map(d => d.Stress_Level),
        mode: 'markers',
        marker: {
            size: 12,
            color: data.map(d => d.Stress_Level),
            colorscale: 'Viridis',
            showscale: true,
        },
        type: 'scatter3d'
    };

    const layout = {
        title: '3D Scatter Plot of Stress Levels by Hours Worked and Virtual Meetings',
        scene: {
            xaxis: { title: 'Hours Worked' },
            yaxis: { title: 'Virtual Meetings' },
            zaxis: { title: 'Stress Level' }
        }
    };

    Plotly.newPlot('stress-levels-chart', [chartData], layout);
}

// END OF LOGANS

