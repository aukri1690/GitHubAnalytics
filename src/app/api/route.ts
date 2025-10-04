import { NextResponse } from 'next/server';
import { graphql } from '@octokit/graphql';

const GET = async () => {
  const octokit = graphql.defaults({
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  });

  const query = `
      query($cursor: String) {
        viewer {
          pullRequests(
            first: 100
            after: $cursor
            orderBy: { field: CREATED_AT, direction: ASC }
          ) {
            nodes {
              createdAt
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

  try {
    const data = await octokit(query, { cursor: null });
    console.log('データを取得できました');
    return NextResponse.json(data);
  } catch (error) {
    console.error('データの取得に失敗しました', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
};

export { GET };