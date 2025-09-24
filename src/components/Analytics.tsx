'use client';

import { useEffect, useState } from 'react';
import { Box, Card, Flex } from "@chakra-ui/react"
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, BarElement, Tooltip, Legend } from "chart.js";
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, BarElement, Tooltip, Legend);

type PRNode = { createdAt: string };

type PRResponse = {
  viewer: {
    pullRequests: {
      totalCount: number;
      nodes: PRNode[];
    };
  };
};

const groupByDate = (prs: PRNode[]) => {
  const counts: Record<string, number> = {};
  prs.forEach(pr => {
    const date = pr.createdAt.split("T")[0];
    counts[date] = (counts[date] || 0) + 1;
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
};

const groupByHour = (prs: PRNode[], tz: string) => {
  const counts = Array(24).fill(0) as number[];
  const fmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', hour12: false, timeZone: tz });
  prs.forEach(pr => {
    const hour = parseInt(fmt.format(new Date(pr.createdAt)), 10);
    if (!Number.isNaN(hour)) counts[hour] += 1;
  });
  const labels = counts.map((_, h) => String(h).padStart(2, '0'));
  return { labels, counts };
};

const Analytics = () => {
  const [pullRequestCount, setPullRequestCount] = useState<number | null>(null);
  const [pullRequestOverTime, setPullRequestOverTime] = useState<any>(null);
  const [pullRequestHourlyDistribution, setPullRequestHourlyDistribution] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api");
        const data: PRResponse = await res.json();

        const nodes = data.viewer.pullRequests.nodes;
        setPullRequestCount(data.viewer.pullRequests.totalCount);

        const groupedByDate = groupByDate(nodes);
        setPullRequestOverTime({
          labels: groupedByDate.map(item => item.date),
          datasets: [
            {
              label: 'PR数',
              data: groupedByDate.map(item => item.count),
              borderColor: "rgba(138, 3, 249, 1)",
              fill: false,
            },
          ],
        });

        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const { labels, counts } = groupByHour(nodes, tz);
        setPullRequestHourlyDistribution({
          labels,
          datasets: [
            {
              label: 'PR数',
              data: counts,
              borderColor: "rgba(3, 249, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (pullRequestCount === null || pullRequestOverTime === null || pullRequestHourlyDistribution === null) ? (
    <Flex justify='center' align='center' minH='100vh'>
      <div>Now Loading...</div>
    </Flex>
  ) : (
    <>
      <Flex justify='center' align='center' minH='100vh'>
        <Card.Root textAlign='center' variant='outline' width='1080px' height='540px' p={5}>
          <Card.Title fontSize='3xl' fontWeight={900} mt={3} mb={3}>Pull Requests Over Time</Card.Title>
          <Box h='100%'>
            <Line
              data={pullRequestOverTime}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    ticks: { precision: 0 }
                  }
                },
              }}
            />
          </Box>
        </Card.Root>
      </Flex>

      <Flex justify='center' align='center' minH='100vh'>
        <Card.Root textAlign='center' variant='outline' width='1080px' height='540px' p={5}>
          <Card.Title fontSize='3xl' fontWeight={900} mt={3} mb={3}>Pull Requests Hourly Distribution</Card.Title>
          <Box h='100%'>
            <Bar
              data={pullRequestHourlyDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                  }
                },
              }}
            />
          </Box>
        </Card.Root>
      </Flex>

      <Flex justify='center' align='center' minH='100vh'>
        <Card.Root textAlign='center' variant='outline' width='250px' height='250px'>
          <Card.Title fontSize='2xl' fontWeight={900} mt={8} mb={-8}>Total Pull Requests</Card.Title>
          <Flex flex='1' justify='center' align='center'>
            <Card.Title fontSize='8xl' fontFamily='Impact' color='orange'>{pullRequestCount}</Card.Title>
          </Flex>
        </Card.Root>
      </Flex>
    </>
  );
};

export default Analytics;