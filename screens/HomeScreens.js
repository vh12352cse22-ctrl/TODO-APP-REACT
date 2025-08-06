import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { FAB, TextInput, Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const json = await AsyncStorage.getItem('tasks');
    setTasks(json != null ? JSON.parse(json) : []);
  };

  const saveTasks = async (newTasks) => {
    setTasks(newTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (!title) return;
    const newTask = { id: Date.now().toString(), title, complete: false };
    const updated = [...tasks, newTask];
    saveTasks(updated);
    setTitle('');
  };

  const toggleTask = (id) => {
    const updated = tasks.map(task =>
      task.id === id ? { ...task, complete: !task.complete } : task
    );
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(task => task.id !== id);
    saveTasks(updated);
  };

  const renderTask = ({ item }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 8 }}>
      <Checkbox
        status={item.complete ? 'checked' : 'unchecked'}
        onPress={() => toggleTask(item.id)}
      />
      <Text style={{ flex: 1 }}>{item.title}</Text>
      <Text onPress={() => deleteTask(item.id)}>🗑️</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        label="New Task"
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={addTask}
      />
      <FlatList data={tasks} keyExtractor={(item) => item.id} renderItem={renderTask} />
      <FAB style={{ position: 'absolute', bottom: 30, right: 20 }} icon="plus" onPress={addTask} />
    </View>
  );
}