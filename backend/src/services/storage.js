import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from '../config/env.js'
import { hashPassword } from '../utils/password.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '../../data')
const USERS_FILE = resolve(DATA_DIR, 'users.json')
const REGISTROS_FILE = resolve(DATA_DIR, 'registros.json')

const writeQueues = new Map()

function enqueueWrite(filePath, task) {
  const previous = writeQueues.get(filePath) || Promise.resolve()
  const next = previous.then(task, task)
  writeQueues.set(filePath, next)
  return next
}

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
}

async function readJsonFile(filePath, createDefault) {
  await ensureDataDir()
  if (!existsSync(filePath)) {
    const initialData = createDefault()
    await writeFile(filePath, JSON.stringify(initialData, null, 2), 'utf-8')
    return initialData
  }

  const raw = await readFile(filePath, 'utf-8')
  return JSON.parse(raw)
}

async function writeJsonFile(filePath, data) {
  await ensureDataDir()
  return enqueueWrite(filePath, () =>
    writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8'),
  )
}

function buildDefaultUsers() {
  return [
    {
      id: 1,
      cracha: '3014716',
      nome: 'Rafael Oliveira da Silva',
      perfil: 'Master',
      isMaster: true,
      passwordHash: hashPassword(env.defaultMasterPassword),
    },
    {
      id: 2,
      cracha: '1000001',
      nome: 'Operador Padrão',
      perfil: 'Operador',
      isMaster: false,
      passwordHash: hashPassword('123456'),
    },
  ]
}

export async function getUsers() {
  return readJsonFile(USERS_FILE, buildDefaultUsers)
}

export async function getRegistros() {
  return readJsonFile(REGISTROS_FILE, () => [])
}

export async function saveRegistros(registros) {
  return writeJsonFile(REGISTROS_FILE, registros)
}
