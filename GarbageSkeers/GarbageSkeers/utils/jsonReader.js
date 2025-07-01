import path from 'path';
import {promises as fs} from 'fs';

/**
 * 
 * @param {string} directory - Directory where the JSON file is Located 
 * @param {string} fileName - The name of the json file to read
 * @returns - json object / array
 */

export async function read_json(directory, fileName){
    try {
        const filePath = path.join(process.cwd(), directory, fileName);
        const json_data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(json_data); //Convert json data in to array
    } catch (error) {
        throw new Error(`Failed to read ${fileName}: ${error.message}`);
    }
}

export async function write_json(directory, fileName, data) {
    try {
        const filePath = path.join(process.cwd(), directory, fileName);
        const json_data = JSON.stringify(data, null, 2); // Pretty format JSON
        await fs.writeFile(filePath, json_data, "utf-8");
        return { message: `${fileName} has been updated successfully` };
    } catch (error) {
        throw new Error(`Failed to write to ${fileName}: ${error.message}`);
    }
}