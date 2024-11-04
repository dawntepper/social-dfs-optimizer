import Snoowrap from 'snoowrap';
import { RateLimiter } from '@/lib/utils/RateLimiter';

export class RedditClient {
  private client: Snoowrap;
  private rateLimiter: RateLimiter;
  private readonly SUBREDDITS = [
    'fantasyfootball',
    'nfl',
    'DynastyFF'
  ];

  constructor() {
    this.client = new Snoowrap({
      userAgent: 'NFL-DFS-Optimizer/1.0',
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      username: process.env.REDDIT_USERNAME!,
      password: process.env.REDDIT_PASSWORD!
    });

    // Limit to 60 requests per minute
    this.rateLimiter = new RateLimiter(60, 60000);
  }

  async getPlayerPosts(playerName: string, options = { limit: 25 }) {
    await this.rateLimiter.waitForToken();

    try {
      const searchPromises = this.SUBREDDITS.map(subreddit =>
        this.client.getSubreddit(subreddit)
          .search({
            query: playerName,
            time: 'day',
            limit: options.limit,
            sort: 'relevance'
          })
      );

      const results = await Promise.all(searchPromises);
      const posts = results.flat();

      return posts.map(post => ({
        id: post.id,
        title: post.title,
        text: post.selftext,
        author: post.author.name,
        subreddit: post.subreddit.display_name,
        score: post.score,
        numComments: post.num_comments,
        created: post.created_utc * 1000,
        url: post.url,
        isVerified: this.isVerifiedSource(post.author.name)
      }));
    } catch (error) {
      console.error('Reddit API Error:', error);
      throw error;
    }
  }

  async getComments(postId: string) {
    await this.rateLimiter.waitForToken();

    try {
      const submission = await this.client.getSubmission(postId).fetch();
      const comments = await submission.comments.fetchAll();

      return comments.map(comment => ({
        id: comment.id,
        text: comment.body,
        author: comment.author.name,
        score: comment.score,
        created: comment.created_utc * 1000,
        isVerified: this.isVerifiedSource(comment.author.name)
      }));
    } catch (error) {
      console.error('Reddit API Error:', error);
      throw error;
    }
  }

  private isVerifiedSource(username: string): boolean {
    // List of known beat writers and reliable sources
    const verifiedSources = [
      'AdamSchefter',
      'RapSheet',
      'FieldYates',
      // Add more verified sources
    ];
    return verifiedSources.includes(username);
  }
}

export const redditClient = new RedditClient();