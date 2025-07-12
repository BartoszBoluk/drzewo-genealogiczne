<template>
  <div>
    <h1>Twoje drzewo genealogiczne</h1>
    <AddPerson @person-added="addPerson" />

    <PeopleList :people="people" />

    <button @click="logout">Wyloguj się</button>
  </div>
</template>

<script>
import AddPerson from '../components/AddPerson.vue'
import PeopleList from '../components/PeopleList.vue'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

export default {
  name: 'UserDashboard',
  components: { AddPerson, PeopleList },
  data() {
    return {
      people: [
        { id: '1', name: 'Jan Kowalski', parents: [], children: [] },
        { id: '2', name: 'Anna Nowak', parents: [], children: [] },
        { id: '3', name: 'Piotr Kowalski', parents: [], children: [] }
      ]
    }
  },
  methods: {
    async logout() {
      await signOut(auth)
      this.$router.push('/login')
    },
    addPerson(newPerson) {
      this.people.push({
        ...newPerson,
        id: Date.now().toString(),
        parents: [],
        children: []
      })
    }
  }
}
</script>
