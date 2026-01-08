import { seedDefaultWorkspaces} from "./seeders/default-workspaces.js";

export async function seedAll() {
    await seedDefaultWorkspaces();
}
