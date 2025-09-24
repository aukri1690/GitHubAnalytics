import { NextResponse } from 'next/server';
import { graphql } from '@octokit/graphql';

const GET = async () => {
  try {
    const client = graphql.defaults({
      headers: {
        authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
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
            totalCount
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

    const data = await client(query, { cursor: null});

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
};

export { GET };