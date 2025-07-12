<template>
  <div>
    <h2>Dodaj osobę</h2>
    <input v-model="name" placeholder="Imię i nazwisko" />
    <input v-model="birthDate" type="date" placeholder="Data urodzenia" />
    <input v-model="birthPlace" placeholder="Miejsce urodzenia" />
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
    const birthDate = ref('')
    const birthPlace = ref('')

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
          birthDate: birthDate.value,
          birthPlace: birthPlace.value,
          parents: [],
          children: [],
          siblings: [],
          grandparents: [],
          auntsUncles: [],
          cousins: []
        })
        name.value = ''
        birthDate.value = ''
        birthPlace.value = ''
        alert('Dodano osobę')
      } catch (error) {
        console.error('Błąd dodawania osoby:', error)
      }
    }

    return { name, birthDate, birthPlace, addPerson }
  }
}
</script>
