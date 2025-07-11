<template>
  <div>
    <h2>Dodaj osobę</h2>
    <input v-model="name" placeholder="Imię i nazwisko" />
    <button @click="addPerson">Dodaj</button>
  </div>
</template>

<script>
import { ref } from 'vue'
import { auth, db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

export default {
  name: 'AddPerson',
  setup() {
    const name = ref('')

    const addPerson = async () => {
      if (!name.value.trim()) {
        alert('Podaj imię i nazwisko')
        return
      }

      const user = auth.currentUser
      if (!user) {
        alert('Musisz być zalogowany')
        return
      }

      try {
        const familyTreeCol = collection(db, 'users', user.uid, 'familyTree')
        await addDoc(familyTreeCol, {
          name: name.value,
          parents: [],
          children: []
        })
        name.value = ''
        alert('Dodano osobę')
      } catch (error) {
        console.error('Błąd dodawania osoby:', error)
      }
    }

    return { name, addPerson }
  }
}
</script>
