// lib/services/MockSpotifyService.ts
import {
    ISpotifyService,
    SpotifyArtist,
    SpotifyTasteData,
    SpotifyTrack,
    SpotifyUserProfile,
  } from './SpotifyService'; // Adjust path as needed
  
  // Helper function to simulate network delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  export class MockSpotifyService implements ISpotifyService {
    async getUserProfile(accessToken: string): Promise<SpotifyUserProfile> {
      console.log('[MockSpotifyService] Fetching user profile...');
      await delay(150); // Simulate delay
      if (!accessToken) throw new Error('Mock Access Token Required');
      return {
        id: 'mock_user_123',
        display_name: 'Mock User',
        email: 'mock@example.com',
        uri: 'spotify:user:mock_user_123',
      };
    }
  
    async getUserTopTracks(
      accessToken: string,
      limit: number = 5,
      time_range: 'long_term' | 'medium_term' | 'short_term' = 'medium_term'
    ): Promise<SpotifyTrack[]> {
      console.log(`[MockSpotifyService] Fetching top ${limit} tracks (${time_range})...`);
      await delay(300);
      if (!accessToken) throw new Error('Mock Access Token Required');
  
      const mockTracks: SpotifyTrack[] = [
        { id: 'track1', name: 'Mock Track One', artists: [{ name: 'Mock Artist A' }], album: { name: 'Mock Album X' }, uri: 'spotify:track:track1' },
        { id: 'track2', name: 'Another Mock Song', artists: [{ name: 'Mock Artist B' }], album: { name: 'Mock Album Y' }, uri: 'spotify:track:track2' },
        { id: 'track3', name: 'Mock Pop Hit', artists: [{ name: 'Mock Artist A' }, { name: 'Mock Artist C' }], album: { name: 'Mock Album Z' }, uri: 'spotify:track:track3' },
        { id: 'track4', name: 'Deep Mock Cut', artists: [{ name: 'Mock Artist D' }], album: { name: 'Mock Album X' }, uri: 'spotify:track:track4' },
        { id: 'track5', name: 'Mock Anthem', artists: [{ name: 'Mock Artist B' }], album: { name: 'Mock Album Y' }, uri: 'spotify:track:track5' },
      ];
      return mockTracks.slice(0, limit);
    }
  
    async getUserTopArtists(
      accessToken: string,
      limit: number = 5,
      time_range: 'long_term' | 'medium_term' | 'short_term' = 'medium_term'
    ): Promise<SpotifyArtist[]> {
      console.log(`[MockSpotifyService] Fetching top ${limit} artists (${time_range})...`);
      await delay(250);
      if (!accessToken) throw new Error('Mock Access Token Required');
  
      const mockArtists: SpotifyArtist[] = [
        { id: 'artistA', name: 'Mock Artist A', genres: ['mock-pop', 'synth-mock'], uri: 'spotify:artist:artistA' },
        { id: 'artistB', name: 'Mock Artist B', genres: ['mock-rock', 'alternative-mock'], uri: 'spotify:artist:artistB' },
        { id: 'artistC', name: 'Mock Artist C', genres: ['mock-hip-hop'], uri: 'spotify:artist:artistC' },
        { id: 'artistD', name: 'Mock Artist D', genres: ['ambient-mock', 'electronic-mock'], uri: 'spotify:artist:artistD' },
        { id: 'artistE', name: 'Mock Artist E', genres: ['mock-folk'], uri: 'spotify:artist:artistE' },
      ];
      return mockArtists.slice(0, limit);
    }
  
    async getRecentlyPlayed(
      accessToken: string,
      limit: number = 5
    ): Promise<SpotifyTrack[]> {
      console.log(`[MockSpotifyService] Fetching ${limit} recently played...`);
      await delay(200);
      if (!accessToken) throw new Error('Mock Access Token Required');
      // Using the same mock tracks for simplicity, but you could vary them
      const mockTracks: SpotifyTrack[] = [
        { id: 'track5', name: 'Mock Anthem', artists: [{ name: 'Mock Artist B' }], album: { name: 'Mock Album Y' }, uri: 'spotify:track:track5' },
        { id: 'track2', name: 'Another Mock Song', artists: [{ name: 'Mock Artist B' }], album: { name: 'Mock Album Y' }, uri: 'spotify:track:track2' },
        { id: 'track4', name: 'Deep Mock Cut', artists: [{ name: 'Mock Artist D' }], album: { name: 'Mock Album X' }, uri: 'spotify:track:track4' },
      ];
      return mockTracks.slice(0, limit);
    }
  
    async getCombinedTasteData(accessToken: string): Promise<SpotifyTasteData> {
      console.log('[MockSpotifyService] Fetching combined taste data...');
      if (!accessToken) throw new Error('Mock Access Token Required');
  
      // Simulate fetching data in parallel
      const [profile, topTracks, topArtists, recentlyPlayed] = await Promise.all([
        this.getUserProfile(accessToken),
        this.getUserTopTracks(accessToken, 5), // Example limit
        this.getUserTopArtists(accessToken, 5),  // Example limit
        this.getRecentlyPlayed(accessToken, 5), // Example limit
      ]);
  
      return {
        profile,
        topTracks,
        topArtists,
        recentlyPlayed,
      };
    }
  }
  