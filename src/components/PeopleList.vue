<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const people = ref([])
const router = useRouter()

const loadPeople = async () => {
  const user = auth.currentUser
  if (!user) {
    alert('Musisz być zalogowany')
    return
  }
  const familyTreeCol = collection(db, 'users', user.uid, 'familyTree')
  const snapshot = await getDocs(familyTreeCol)
  people.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

onMounted(loadPeople)

function viewPerson(person) {
  router.push({ name: 'PersonDetails', params: { id: person.id } })
}
</script>

<template>
  <div>
    <h2>Lista osób</h2>
    <ul>
      <li v-for="person in people" :key="person.id">
        <a href="#" @click.prevent="viewPerson(person)">{{ person.name }}</a>
      </li>
    </ul>
  </div>
</template>
