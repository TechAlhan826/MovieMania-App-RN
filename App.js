import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Image, FlatList, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useState, useEffect } from 'react';
import getlang from 'iso-639-1'; 
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';
//import dotenv from 'dotenv';


//dotenv.config();
const API_KEY = 'your-tmdb-api-key';
const IMG_URL = (path) => `https://image.tmdb.org/t/p/w500${path}`;

export default function App() {
  const [search, setSearch] = useState('');
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState('');
  const [expanded, setExpanded] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const formatCount = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 10_00_000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1_000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const genreList = {
    '': 'All',
    '28': 'Action',
    '35': 'Comedy',
    '878': 'Sci-Fi',
    '18': 'Drama',
    '10749': 'Romance'
  };

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getMovies = async (reset = false) => {
    setLoading(true);
    try {
      const query = search ? `&query=${search}` : '';
      const genreFilter = genre ? `&with_genres=${genre}` : '';
      const response = await axios.get(
        `https://api.themoviedb.org/3/${search ? 'search' : 'discover'}/movie?api_key=${API_KEY}&language=en-US&page=${reset ? 1 : page}${query}${genreFilter}`
      );
      const newMovies = reset ? response.data.results : [...movies, ...response.data.results];
      setMovies(newMovies);
      setPage((prev) => (reset ? 2 : prev + 1));
    } catch (err) {
      console.log('Error fetching movies:', err.message, err.response?.data || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMovies(true);
  }, [genre]);

  const handleSearch = () => {
    setPage(1);
    getMovies(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    getMovies(true);
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.movieItem}>
      {(item.backdrop_path || item.poster_path) ? (
  <Image
    style={styles.img}
    source={{ uri: IMG_URL(item.backdrop_path || item.poster_path) }}
  />
) : (
  <Text style={{ color: '#999', marginBottom: 8 }}>No image available</Text>
)}

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.overview}>
        {expanded[item.id]
          ? item.overview
          : item.overview?.length > 100
          ? `${item.overview.substring(0, 100)}...`
          : item.overview}
      </Text>
      {item.overview?.length > 100 && (
        <TouchableOpacity onPress={() => toggleExpanded(item.id)}>
          <Text style={styles.moreLess}>{expanded[item.id] ? 'Show Less' : 'Show More'}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.meta}>
        <Icon name="language" size={16} color="#FFD700" /> {getlang.getName(item.original_language) || item.original_language}
        {'   '}
        <Icon name="star" size={16} color="#FFD700" /> {item.vote_average.toFixed(1)}/10
        {'   '}
        Rated by {formatCount(item.vote_count)}
      </Text>
      <Text style={styles.date}>Release Date: {item.release_date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.header}>MovieMania</Text>
      <Text style={styles.tagline}>Your Perfect Destiny for Exploring Movies</Text>

      <Text style={{ color: '#888', textAlign: 'center', marginTop: 12, marginBottom:16 }}>
  ACM Phase-2 AppDev Task done with ❤️ by Alhan —
  <Text
  style={{ color: '#FFD700', textDecorationLine: 'underline' }}
  onPress={() => Linking.openURL('https://github.com/TechAlhan826/MovieMania-App-RN')}
>
  GitHub Repo
</Text>
</Text>


      <TextInput
        style={styles.input}
        placeholder="Search Movies"
        placeholderTextColor="#999"
        onChangeText={(text) => setSearch(text)}
        onSubmitEditing={handleSearch}
      />

      <Picker
  selectedValue={genre}
  style={styles.picker}
  itemStyle={{ color: '#fff' }}
  dropdownIconColor="#FFD700"
  onValueChange={(val) => setGenre(val)}
>
  {Object.entries(genreList).map(([key, val]) => (
    <Picker.Item label={val} value={key} key={key} color="#1E1E1E" />
  ))}
</Picker>


      {movies.length === 0 && !loading && <Text style={styles.nodata}>No movies found</Text>}

      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={() => getMovies()}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListFooterComponent={loading && <ActivityIndicator size="large" color="#FFD700" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  header: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginTop: 8,
  },
  tagline: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    color: '#fff',
    width: '100%',
    padding: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  picker: {
  width: '100%',
  backgroundColor: '#1E1E1E',
  borderRadius: 6,
  marginBottom: 16,
  color: '#fff',
  height: 48, // fixes iOS padding issue
  paddingHorizontal: 8,
},
  movieItem: {
    backgroundColor: '#1E1E1E',
    marginVertical: 8,
    padding: 12,
    borderRadius: 10,
    width: '100%',
    alignSelf: 'center',
  },
  img: {
    height: 200,
    borderRadius: 6,
    marginBottom: 8,
  },
  title: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  overview: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  moreLess: {
    color: '#00BFFF',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  meta: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 4,
  },
  date: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  nodata: {
    color: '#888',
    fontSize: 16,
    marginTop: 32,
    fontStyle: 'italic',
  },
});
