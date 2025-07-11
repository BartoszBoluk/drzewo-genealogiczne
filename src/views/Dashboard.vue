<template>
  <div>
    <h1>Twoje drzewo genealogiczne</h1>
    <AddPerson />
    <PeopleList />
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
  methods: {
    async logout() {
      await signOut(auth)
      this.$router.push('/login')
    }
  }
}
</script>

