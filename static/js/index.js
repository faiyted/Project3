


 const sleep_quality_mapping = {
            'Poor': 0,
            'Average': 1,
            'Good': 2
        };

        function drawChart(data, xAxisField) {
            const groupedData = d3.group(data, d => d[xAxisField]);

            const xAxisCategories = Array.from(groupedData.keys());

            let poorCounts = [];
            let averageCounts = [];
            let goodCounts = [];

            xAxisCategories.forEach(category => {
                const categoryData = groupedData.get(category) || [];

                let poorCount = 0;
                let averageCount = 0;
                let goodCount = 0;

                categoryData.forEach(d => {
                    if (d.Sleep_Quality === sleep_quality_mapping['Poor']) {
                        poorCount++;
                    } else if (d.Sleep_Quality === sleep_quality_mapping['Average']) {
                        averageCount++;
                    } else if (d.Sleep_Quality === sleep_quality_mapping['Good']) {
                        goodCount++;
                    }
                });

                poorCounts.push(poorCount);
                averageCounts.push(averageCount);
                goodCounts.push(goodCount);
            });

            const trace1 = {
                x: xAxisCategories,
                y: poorCounts,
                name: 'Poor',
                type: 'bar'
            };

            const trace2 = {
                x: xAxisCategories,
                y: averageCounts,
                name: 'Average',
                type: 'bar'
            };

            const trace3 = {
                x: xAxisCategories,
                y: goodCounts,
                name: 'Good',
                type: 'bar'
            };

            const traces = [trace1, trace2, trace3];

            const layout = {
                title: `${xAxisField.replace('_', ' ')} vs Sleep Quality`,
                barmode: 'stack',
                xaxis: { title: xAxisField.replace('_', ' ') },
                yaxis: { title: 'Number of People' },
            };

            Plotly.newPlot('stacked-bar-chart', traces, layout);
        }

        d3.json('../cleanDataset.json')
            .then(data => {
                drawChart(data, 'Physical_Activity');

                const selectBox = document.getElementById('xAxisSelect');
                selectBox.addEventListener('change', (event) => {
                    const selectedXAxis = event.target.value;
                    drawChart(data, selectedXAxis);
                });
            })
            .catch(error => {
                console.error("Error loading JSON data:", error);
            });