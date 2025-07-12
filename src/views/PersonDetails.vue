<template>
  <div>
    <h1>Szczegóły osoby</h1>

    <button @click="goToDashboard" style="margin-bottom: 10px;">⬅️ Wróć do dashboardu</button>

    <div>
      <label>Imię i nazwisko:</label>
      <input v-model="person.name" readonly />
    </div>

    <div>
      <label>Data urodzenia:</label>
      <input
        type="date"
        v-model="person.birthDate"
        @change="updateField('birthDate', person.birthDate)"
      />
    </div>

    <div>
      <label>Miejsce urodzenia:</label>
      <input
        v-model="person.birthPlace"
        @change="updateField('birthPlace', person.birthPlace)"
      />
    </div>

    <hr />

    <h2>Dodaj relację</h2>
    <div>
      <input v-model="newRelative.firstName" placeholder="Imię" />
      <input v-model="newRelative.lastName" placeholder="Nazwisko" />
      <select v-model="newRelative.relation">
        <option disabled value="">Wybierz relację</option>
        <option value="parents">Matka/Tata (Rodzice)</option>
        <option value="siblings">Rodzeństwo</option>
        <option value="grandparents">Dziadkowie</option>
        <option value="auntsUncles">Ciotki i wujkowie</option>
        <option value="cousins">Kuzyni</option>
        <option value="children">Dzieci</option>
      </select>
      <button @click="addRelation">Dodaj</button>
    </div>

    <hr />

    <h2>Relacje</h2>
    <table border="1" cellpadding="5">
      <thead>
        <tr>
          <th>Relacja</th>
          <th>Imię i nazwisko</th>
          <th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(group, key) in relationGroups" :key="key">
          <tr v-for="(p, i) in person[key]" :key="key + '-' + i">
            <td v-if="i === 0" :rowspan="person[key].length">{{ group }}</td>
            <td><a @click.prevent="goToPerson(p.id)">{{ p.name }}</a></td>
            <td><button @click="removeRelation(key, p.id)">Usuń</button></td>
          </tr>
        </template>

        <tr v-if="!hasAnyRelations">
          <td colspan="3" style="text-align:center;">Brak dodanych relacji</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import {
  doc, getDoc, updateDoc, arrayUnion, arrayRemove,
  addDoc, collection, query, where, getDocs
} from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const user = auth.currentUser

const person = ref({
  name: '',
  birthDate: '',
  birthPlace: '',
  parents: [],
  siblings: [],
  grandparents: [],
  auntsUncles: [],
  cousins: [],
  children: []
})

const newRelative = ref({
  firstName: '',
  lastName: '',
  relation: ''
})

const hasAnyRelations = computed(() => {
  return Object.values(relationKeys).some(key => person.value[key]?.length > 0)
})

const relationGroups = {
  parents: 'Rodzice',
  siblings: 'Rodzeństwo',
  grandparents: 'Dziadkowie',
  auntsUncles: 'Ciotki i wujkowie',
  cousins: 'Kuzyni',
  children: 'Dzieci'
}

const relationKeys = Object.keys(relationGroups)

async function fetchPerson() {
  if (!user) {
    alert('Musisz być zalogowany')
    return
  }

  const docRef = doc(db, 'users', user.uid, 'familyTree', route.params.id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    const data = docSnap.data()
    for (const key of relationKeys) {
      if (!data[key]) data[key] = []
    }
    person.value = {
      name: data.name || '',
      birthDate: data.birthDate || '',
      birthPlace: data.birthPlace || '',
      ...Object.fromEntries(relationKeys.map(k => [k, data[k]]))
    }
  } else {
    alert('Nie znaleziono osoby')
  }
}

watch(() => route.params.id, fetchPerson)

onMounted(() => {
  fetchPerson()
})

function goToPerson(personId) {
  router.push({ name: 'PersonDetails', params: { id: personId } })
}

function goToDashboard() {
  router.push({ name: 'Dashboard' })
}

async function updateField(field, value) {
  if (!user) return
  const docRef = doc(db, 'users', user.uid, 'familyTree', route.params.id)
  try {
    await updateDoc(docRef, { [field]: value })
  } catch (error) {
    console.error('Błąd aktualizacji pola:', error)
  }
}

async function findPersonIdByName(name) {
  const userFamilyTreeCol = collection(db, 'users', user.uid, 'familyTree')
  const q = query(userFamilyTreeCol, where('name', '==', name))
  const querySnapshot = await getDocs(q)
  if (!querySnapshot.empty) return querySnapshot.docs[0].id
  return null
}

function getReverseRelation(relation) {
  const map = {
    parents: 'children',
    children: 'parents',
    siblings: 'siblings',
    grandparents: 'grandchildren',
    auntsUncles: 'niecesNephews',
    cousins: 'cousins'
  }
  return map[relation] || null
}

async function addRelation() {
  if (!newRelative.value.firstName.trim() || !newRelative.value.lastName.trim()) {
    alert('Podaj imię i nazwisko')
    return
  }
  if (!newRelative.value.relation) {
    alert('Wybierz relację')
    return
  }

  const fullName = `${newRelative.value.firstName.trim()} ${newRelative.value.lastName.trim()}`
  const userFamilyTreeCol = collection(db, 'users', user.uid, 'familyTree')

  try {
    const existingPersonId = await findPersonIdByName(fullName)
    let relativeId = existingPersonId

    if (!relativeId) {
      const docRef = await addDoc(userFamilyTreeCol, {
        name: fullName,
        birthDate: '',
        birthPlace: '',
        parents: [],
        siblings: [],
        grandparents: [],
        auntsUncles: [],
        cousins: [],
        children: []
      })
      relativeId = docRef.id
    }

    const docRefCurrent = doc(db, 'users', user.uid, 'familyTree', route.params.id)
    await updateDoc(docRefCurrent, {
      [newRelative.value.relation]: arrayUnion({ name: fullName, id: relativeId })
    })

    // odwrotna relacja
    const reverseRel = getReverseRelation(newRelative.value.relation)
    if (reverseRel) {
      const reverseRef = doc(db, 'users', user.uid, 'familyTree', relativeId)
      const currentPersonDoc = await getDoc(docRefCurrent)
      const currentName = currentPersonDoc.exists() ? currentPersonDoc.data().name : 'Nieznany'

      await updateDoc(reverseRef, {
        [reverseRel]: arrayUnion({ name: currentName, id: route.params.id })
      })
    }

    await fetchPerson()
    newRelative.value = { firstName: '', lastName: '', relation: '' }
  } catch (error) {
    console.error('Błąd dodawania relacji:', error)
    alert('Nie udało się dodać relacji')
  }
}

async function removeRelation(relationKey, personIdToRemove) {
  const docRef = doc(db, 'users', user.uid, 'familyTree', route.params.id)
  const updated = person.value[relationKey].filter(p => p.id !== personIdToRemove)
  try {
    await updateDoc(docRef, { [relationKey]: updated })
    person.value[relationKey] = updated
  } catch (err) {
    console.error('Błąd przy usuwaniu relacji:', err)
    alert('Nie udało się usunąć relacji')
  }
}
</script>

<style scoped>
label {
  display: inline-block;
  width: 150px;
  font-weight: bold;
}
input,
select {
  margin-bottom: 10px;
  padding: 5px;
}
button {
  margin-left: 10px;
  padding: 5px 10px;
}
table {
  margin-top: 15px;
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  padding: 8px;
  text-align: left;
}
a {
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}
</style>
