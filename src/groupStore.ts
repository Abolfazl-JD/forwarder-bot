import fs from "fs";
import path from "path";

const FILE = path.join(__dirname, "..", "groups.json");

export function loadGroups(): string[] {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    return [];
  }
}

export function saveGroups(list: string[]) {
  try {
    fs.writeFileSync(FILE, JSON.stringify(list, null, 2), "utf8");
  } catch (e) {
    console.error(new Date().toString(), "Failed to save groups.json", e);
  }
}

export function addGroup(chatId: number | string) {
  const id = String(chatId);
  const list = loadGroups();
  if (!list.includes(id)) {
    list.push(id);
    saveGroups(list);
    console.log(new Date().toString(), `Added group ${id}`);
  }
}

export function removeGroup(chatId: number | string) {
  const id = String(chatId);
  const list = loadGroups();
  const newList = list.filter((x) => x !== id);
  if (newList.length !== list.length) {
    saveGroups(newList);
    console.log(new Date().toString(), `Removed group ${id}`);
  }
}

export function getGroups(): string[] {
  return loadGroups();
}
