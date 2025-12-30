import SpotifyWebApi from 'spotify-web-api-node';

export class SpotifyService {
  private spotifyApi: SpotifyWebApi;
  private tokenExpirationTime: number = 0;

  constructor() {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      throw new Error("Spotify API credentials are not set in environment variables.");
    }

    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
  }

  private async ensureAccessToken() {
    if (Date.now() < this.tokenExpirationTime) return;

    try {
      const data = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(data.body['access_token']);
      
      this.tokenExpirationTime = Date.now() + (data.body['expires_in'] * 1000) - 60000;
    } catch (error) {
      console.error('Error obtaining Spotify access token:', error);
      throw new Error('Spotify Auth Failed');
    }
  }

  private extractArtistId(input: string): string {
    if (input.includes('artist/')) {
      const parts = input.split('artist/');
      if (parts.length > 1) {
        return parts[1].split('?')[0]; 
      }
    }
    if (input.includes('spotify:artist:')) {
      return input.split(':')[2];
    }
    return input.trim();
  }

  async getBandDetails(spotifyLinkOrId: string) {
    if (!spotifyLinkOrId) return null;

    await this.ensureAccessToken();
    const artistId = this.extractArtistId(spotifyLinkOrId);

    try {
      const response = await this.spotifyApi.getArtist(artistId);
      return {
        popularity: response.body.popularity,
        imageUrl: response.body.images[0]?.url || null,
        url: response.body.external_urls.spotify
      };
    } catch (error) {
      console.warn(`Band not found on Spotify: ${artistId}`);
      return null;
    }
  }
}