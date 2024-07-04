<template>
    <div>
      <input v-model="inputValue" placeholder="burger king id" type="number"></input>
      <button @click="handleSubmit" :disabled="loading">
        {{ loading ? 'Loading...' : 'Complete Survey' }}
      </button>
      <p v-if="completionCode">Completion Code: {{ completionCode }}</p>
    </div>
  </template>
  
  <script script setup lang="ts">
  import { ref } from 'vue';
  
  const completionCode = ref('');
  const loading = ref(false);
  const inputValue = ref('');
  
  const handleSubmit = async () => {
    loading.value = true;
    const response = await fetch(`/api/complete-survey?bk=${encodeURIComponent(inputValue.value)}`);
    const data = await response.json();
    completionCode.value = data.code;
    loading.value = false;
  };
  </script>
  