
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