<template>
  <div>
    <h2>Lista osób</h2>
    <ul>
      <li v-for="person in people" :key="person.id">
        <button @click="selectPerson(person)">{{ person.name }}</button>
      </li>
    </ul>

    <div v-if="selectedPerson">
      <h3>Wybrana osoba: {{ selectedPerson.name }}</h3>
      <p>Rodzice:</p>
      <ul>
        <li v-for="parent in parents" :key="parent.id">{{ parent.name }}</li>
      </ul>

      <p>Dzieci:</p>
      <ul>
        <li v-for="child in children" :key="child.id">{{ child.name }}</li>
      </ul>

      <h4>Dodaj rodzica:</h4>
      <select v-model="newParentId">
        <option disabled value="">Wybierz osobę</option>
        <option v-for="person in people" :key="person.id" :value="person.id" v-if="person.id !== selectedPerson.id && !parentsIds.includes(person.id)">
          {{ person.name }}
        </option>
      </select>
      <button @click="addParent">Dodaj rodzica</button>

      <h4>Dodaj dziecko:</h4>
      <select v-model="newChildId">
        <option disabled value="">Wybierz osobę</option>
        <option v-for="person in people" :key="person.id" :value="person.id" v-if="person.id !== selectedPerson.id && !childrenIds.includes(person.id)">
          {{ person.name }}
        </option>
      </select>
      <button @click="addChild">Dodaj dziecko</button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { auth, db } from '../firebase'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { collection, onSnapshot } from 'firebase/firestore'

export default {
  name: 'PeopleList',
  setup() {
    const people = ref([])
    const selectedPerson = ref(null)
    const newParentId = ref('')
    const newChildId = ref('')

    const parents = ref([])
    const children = ref([])

    // Pobierz listę osób i nasłuchuj zmian
    
    const user = auth.currentUser
    if (user) {
      const familyTreeCol = collection(db, 'users', user.uid, 'familyTree')
      onSnapshot(familyTreeCol, (snapshot) => {
        people.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Aktualizuj rodziców i dzieci przy zmianie listy osób
        if (selectedPerson.value) {
          updateRelatives()
        }
      })
    }

    // Id rodziców i dzieci dla wybranej osoby
    const parentsIds = computed(() => selectedPerson.value ? selectedPerson.value.parents || [] : [])
    const childrenIds = computed(() => selectedPerson.value ? selectedPerson.value.children || [] : [])

    // Funkcja aktualizująca szczegóły rodziców i dzieci z pełnymi danymi
    function updateRelatives() {
      parents.value = people.value.filter(p => parentsIds.value.includes(p.id))
      children.value = people.value.filter(p => childrenIds.value.includes(p.id))
    }

    // Po wybraniu osoby
    function selectPerson(person) {
      selectedPerson.value = person
      updateRelatives()
      newParentId.value = ''
      newChildId.value = ''
    }

    // Funkcja dodająca rodzica
    async function addParent() {
      if (!newParentId.value) return alert('Wybierz rodzica')

      const user = auth.currentUser
      if (!user) return alert('Musisz być zalogowany')

      const personDoc = doc(db, 'users', user.uid, 'familyTree', selectedPerson.value.id)
      const parentDoc = doc(db, 'users', user.uid, 'familyTree', newParentId.value)

      try {
        // Aktualizuj dokument wybranej osoby — dodaj rodzica
        await updateDoc(personDoc, {
          parents: [...(selectedPerson.value.parents || []), newParentId.value]
        })

        // Aktualizuj dokument rodzica — dodaj dziecko
        // Najpierw pobierz aktualny stan rodzica
        const parentSnap = await getDoc(parentDoc)
        if (parentSnap.exists()) {
          const parentData = parentSnap.data()
          const updatedChildren = [...(parentData.children || []), selectedPerson.value.id]
          await updateDoc(parentDoc, { children: updatedChildren })
        }

        alert('Dodano rodzica')
        // Odśwież dane lokalnie, bo onSnapshot nasłuchuje
        selectedPerson.value.parents.push(newParentId.value)
        newParentId.value = ''
        updateRelatives()
      } catch (error) {
        console.error('Błąd dodawania rodzica:', error)
      }
    }

    // Funkcja dodająca dziecko
    async function addChild() {
      if (!newChildId.value) return alert('Wybierz dziecko')

      const user = auth.currentUser
      if (!user) return alert('Musisz być zalogowany')

      const personDoc = doc(db, 'users', user.uid, 'familyTree', selectedPerson.value.id)
      const childDoc = doc(db, 'users', user.uid, 'familyTree', newChildId.value)

      try {
        // Aktualizuj dokument wybranej osoby — dodaj dziecko
        await updateDoc(personDoc, {
          children: [...(selectedPerson.value.children || []), newChildId.value]
        })

        // Aktualizuj dokument dziecka — dodaj rodzica
        const childSnap = await getDoc(childDoc)
        if (childSnap.exists()) {
          const childData = childSnap.data()
          const updatedParents = [...(childData.parents || []), selectedPerson.value.id]
          await updateDoc(childDoc, { parents: updatedParents })
        }

        alert('Dodano dziecko')
        selectedPerson.value.children.push(newChildId.value)
        newChildId.value = ''
        updateRelatives()
      } catch (error) {
        console.error('Błąd dodawania dziecka:', error)
      }
    }

    return {
      people,
      selectedPerson,
      selectPerson,
      parents,
      children,
      newParentId,
      newChildId,
      addParent,
      addChild,
      parentsIds,
      childrenIds
    }
  }
}
</script>
