import { Card, CardContent, Typography } from "@mui/material";
import Plot from "react-plotly.js";
import { DetailItem, StatItem } from "src/types";

const getHoverDetails = (date: string, details: DetailItem[]) => {
    const dateDetails = details.filter(item => item.date === date);
    if (dateDetails.length === 0) return { title: 'Нет данных', content: [] };

    return {
      title: `Детали на ${date}`,
      content: dateDetails.map(item => ({
        product: item.productName,
        buyer: item.userLogin,
      })),
    };
  };

export const renderPlot = (title: string, data: StatItem[], details: DetailItem[], color: string) => (
    <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 3, backgroundColor: '#fafafa', width: '100%' }}>
      <CardContent sx={{ padding: 0 }}>
        <Typography variant="h6" fontSize="16px" gutterBottom sx={{ paddingX: 2, paddingTop: 2 }}>
          {title}
        </Typography>
        <div style={{ width: '100%', overflow: 'hidden', paddingLeft: '20px' }}>
          <Plot
            data={[
              {
                x: data.map(item => item._id),
                y: data.map(item => item.total),
                type: 'scatter',
                mode: 'lines+markers',
                name: title,
                line: { color },
                marker: {
                  color,
                  size: 8,
                  line: { width: 1, color: '#ffffff' },
                },
                text: data.map(item => {
                  const hoverInfo = getHoverDetails(item._id, details);
                  return hoverInfo.content
                    .map((d, i) => `<b>${i === 0 ? hoverInfo.title : ''}</b><br>Товар: ${d.product}<br>Покупатель: ${d.buyer}`)
                    .join('<br>');
                }),
                hoverinfo: 'text',
                hoverlabel: {
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  bordercolor: 'orange',
                  font: {
                    size: 12,
                    color: '#333333',
                    family: 'Arial, sans-serif',
                  },
                  align: 'left',
                },
              },
            ]}
            layout={{
              height: 400,
              autosize: true,
              xaxis: {
                title: { text: 'Дата', font: { size: 14 } },
                type: 'date',
                fixedrange: true,
                tickformat: '%Y-%m-%d',
                automargin: true,
              },
              yaxis: {
                title: { text: 'Количество', font: { size: 14 } },
                tickformat: '.0f',
                range: [0, Math.max(...data.map(d => d.total || 0), 1) * 1.2],
                fixedrange: true,
                dtick: 1,
                automargin: true,
              },
              margin: { t: 20, b: 60, l: 60, r: 20 },
              plot_bgcolor: '#f5f7fa',
              paper_bgcolor: '#f5f7fa',
              dragmode: false,
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%' }}
          />
        </div>
      </CardContent>
    </Card>
  );