import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Keyboard,
  StyleSheet,
  Platform,
  Text as RNText,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text as PaperText,
  IconButton,
  Provider as PaperProvider,
  Snackbar,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem('tasks');
      if (stored) setTasks(JSON.parse(stored));
      console.log("Loaded tasks:", JSON.parse(stored));
    } catch (e) {
      console.error('Error loading tasks:', e);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      setTasks(newTasks);
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      console.log("Saved tasks:", newTasks);
    } catch (e) {
      console.error('Error saving tasks:', e);
    }
  };

  const handleAddOrUpdate = async () => {
    console.log("Add/Update Triggered with:", taskText);
    if (taskText.trim() === '') return;

    if (editingId) {
      const updatedTasks = tasks.map((task) =>
        task.id === editingId ? { ...task, text: taskText } : task
      );
      await saveTasks(updatedTasks);
      setEditingId(null);
      showSnackbar('Task updated');
    } else {
      const newTask = {
        id: uuidv4(),
        text: taskText.trim(),
        isCompleted: false,
      };
      await saveTasks([...tasks, newTask]);
      showSnackbar('Task added');
    }

    setTaskText('');
    Keyboard.dismiss();
  };

  const handleEdit = (task) => {
    setTaskText(task.text);
    setEditingId(task.id);
  };

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm('Are you sure you want to delete this task?');
      if (!confirmDelete) return;
      const updatedTasks = tasks.filter((task) => task.id !== id);
      saveTasks(updatedTasks);
      showSnackbar('Task deleted');
    } else {
      Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter((task) => task.id !== id);
            await saveTasks(updatedTasks);
            showSnackbar('Task deleted');
          },
        },
      ]);
    }
  };

  const handleToggleComplete = async (id) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    await saveTasks(updated);
    const completedTask = updated.find((task) => task.id === id);
    showSnackbar(completedTask.isCompleted ? 'Task completed' : 'Task unchecked');
  };

  const showSnackbar = (message) => {
    setSnackbar({ visible: true, message });
  };

  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <PaperText variant="headlineMedium" style={styles.title}>
          📝 My ToDo List
        </PaperText>

        <TextInput
          label={editingId ? 'Edit Task' : 'New Task'}
          value={taskText}
          onChangeText={setTaskText}
          mode="outlined"
          style={styles.input}
          placeholderTextColor="#3f51b5"
        />

        <Button
          mode="contained"
          onPress={handleAddOrUpdate}
          style={styles.button}
        >
          {editingId ? 'Update Task' : 'Add Task'}
        </Button>

        <TextInput
          label="Search Tasks"
          value={searchText}
          onChangeText={(text) => {
            console.log("Search input:", text);
            setSearchText(text);
          }}
          mode="outlined"
          style={styles.searchInput}
          placeholderTextColor="#3f51b5"
        />

        <FlatList
          data={filteredTasks}
          ListHeaderComponent={() => (
            <PaperText style={{ textAlign: 'center', marginBottom: 10 }}>
              Showing {filteredTasks.length} tasks
            </PaperText>
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card
              style={[styles.card, item.isCompleted && styles.cardCompleted]}
            >
              <Card.Content style={styles.cardContent}>
                <IconButton
                  icon={item.isCompleted ? 'check-circle' : 'circle-outline'}
                  color={item.isCompleted ? '#4caf50' : '#757575'}
                  onPress={() => handleToggleComplete(item.id)}
                />

                <PaperText
                  style={[
                    styles.taskText,
                    item.isCompleted && styles.taskTextCompleted,
                  ]}
                >
                  {item.text}
                </PaperText>

                <View style={styles.actionIcons}>
                  <IconButton icon="pencil" onPress={() => handleEdit(item)} />
                  <IconButton
                    icon="delete"
                    onPress={() => handleDelete(item.id)}
                  />
                </View>
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <PaperText style={styles.emptyText}>
                No tasks found. Add a new one!
              </PaperText>
            </View>
          )}
        />

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ visible: false, message: '' })}
          duration={2000}
          style={{ backgroundColor: '#333' }}
        >
          {snackbar.message}
        </Snackbar>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#e8eaf6',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#3f51b5',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginBottom: 20,
    backgroundColor: '#3f51b5',
  },
  searchInput: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 3,
  },
  cardCompleted: {
    backgroundColor: '#e0e0e0',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#424242',
    paddingLeft: 10,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9e9e9e',
  },
  actionIcons: {
    flexDirection: 'row',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
  },
});