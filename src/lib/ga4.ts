import { getGoogleAccessToken } from './gsc';

export interface Ga4PerformanceSummary {
  screenPageViews: number;
  activeUsers: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: { path: string; views: number }[];
}

/**
 * Queries Google Analytics 4 (Data API v1beta)
 */
export async function queryGa4Analytics(
  clientEmail: string,
  privateKey: string,
  propertyId: string,
  days: number = 28
): Promise<Ga4PerformanceSummary> {
  const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
  const token = await getGoogleAccessToken(clientEmail, privateKey, scopes);

  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  const endDate = 'today';
  const startDate = `${days}daysAgo`;

  const body = {
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
    dimensions: [{ name: 'pagePath' }],
    metricAggregations: ['TOTAL'],
    keepEmptyRows: false,
    orderBys: [
      {
        metric: { metricName: 'screenPageViews' },
        desc: true,
      }
    ],
    limit: 10
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errData = await response.json();
      if (errData.error?.message) {
        errorMsg = errData.error.message;
      }
    } catch {
      // ignore
    }
    throw new Error(`GA4 API Error: ${response.status} ${errorMsg}`);
  }

  const data = await response.json();

  let screenPageViews = 0;
  let activeUsers = 0;
  let bounceRate = 0;
  let averageSessionDuration = 0;

  if (data.totals && data.totals.length > 0 && data.totals[0].metricValues) {
    const totalMetrics = data.totals[0].metricValues;
    screenPageViews = parseInt(totalMetrics[0]?.value || '0', 10);
    activeUsers = parseInt(totalMetrics[1]?.value || '0', 10);
    bounceRate = parseFloat(totalMetrics[2]?.value || '0');
    averageSessionDuration = parseFloat(totalMetrics[3]?.value || '0');
  }

  const topPages: { path: string; views: number }[] = [];
  
  if (data.rows && Array.isArray(data.rows)) {
    for (const row of data.rows) {
      if (row.dimensionValues && row.metricValues) {
        topPages.push({
          path: row.dimensionValues[0]?.value || '/',
          views: parseInt(row.metricValues[0]?.value || '0', 10)
        });
      }
    }
  }

  return {
    screenPageViews,
    activeUsers,
    bounceRate,
    averageSessionDuration,
    topPages,
  };
}
