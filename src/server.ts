import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CreateMessageResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { connectDB } from "./db/connection.js";
import {
  getAllUsers,
  getUserById,
  createUser as createUserInDB,
} from "./db/userRepository.js";

const server = new McpServer({
  name: "test",
  version: "1.0.0",
});

server.resource(
  "users",
  "users://all",
  {
    description: "Get all users data from the database",
    title: "Users",
    mimeType: "application/json",
  },
  async (uri) => {
    const users = await getAllUsers();

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(users),
          mimeType: "application/json",
        },
      ],
    };
  },
);

server.resource(
  "user-details",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  {
    description: "Get a user's details from the database",
    title: "User Details",
    mimeType: "application/json",
  },
  async (uri, { userId }) => {
    const user = await getUserById(userId as string);

    if (user === null) {
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ error: "No user found for the given ID" }),
            mimeType: "application/json",
          },
        ],
      };
    }

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(user),
          mimeType: "application/json",
        },
      ],
    };
  },
);

server.tool(
  "create-user",
  "Create a new user in database",
  {
    name: z.string(),
    email: z.string(),
    address: z.string(),
    phone: z.string(),
  },
  {
    title: "Create User",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const id = await createUserInDB(params);

      return {
        content: [{ type: "text", text: `User ${id} created successfully` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: "Failed to save user" }],
      };
    }
  },
);

server.tool(
  "create-random-user",
  "Create a random user with fake data",
  {
    title: "Create Random User",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async () => {
    const result = await server.server.request(
      {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Generate fake user data. The user should have a realistic name, email, address, and phone number. Return this data as a JSON object with no other text or formatter so it can be used with JSON.parse.",
              },
            },
          ],
          maxTokens: 1024,
        },
      },
      CreateMessageResultSchema,
    );

    if (result.content.type !== "text") {
      return {
        content: [{ type: "text", text: "Failed to generate user data" }],
      };
    }

    try {
      const fakeUser = JSON.parse(
        result.content.text
          .trim()
          .replace(/^```json/, "")
          .replace(/```$/, "")
          .trim(),
      );

      const id = await createUserInDB(fakeUser);

      return {
        content: [{ type: "text", text: `User ${id} created successfully` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: error }],
      };
    }
  },
);

server.prompt(
  "generate-fake-user",
  "Generate a fake user based on a given name",
  {
    name: z.string(),
  },
  ({ name }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a fake user with the name ${name}. The user should have a realistic email, address, and phone number.`,
          },
        },
      ],
    };
  },
);

async function main() {
  await connectDB();

  console.log("DB Connected");

  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main();
