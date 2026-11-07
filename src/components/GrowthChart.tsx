'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface Props {
  labels: string[]
  data: number[]
  goal: number
}

export default function GrowthChart({ labels, data, goal }: Props) {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'الثروة',
        data,
        borderColor: '#D4A017',
        backgroundColor: 'rgba(212,160,23,0.1)',
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            'الثروة: ' + Math.round(ctx.parsed.y).toLocaleString('ar-SA') + ' ريال',
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: {
          color: '#888',
          font: { size: 11, family: 'Tajawal' },
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: {
          color: '#888',
          font: { size: 11, family: 'Tajawal' },
          callback: (v: any) => {
            if (v >= 1000000) return (v / 1000000).toFixed(1) + 'م'
            if (v >= 1000) return (v / 1000).toFixed(0) + 'ك'
            return v
          },
        },
      },
    },
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '260px' }}>
      <Line data={chartData} options={options as any} />
    </div>
  )
}
