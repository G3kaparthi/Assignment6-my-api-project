const express = require('express');
const mariadb = require('mariadb');
const app = express();
const port = 3000;
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');
const cors = require('cors');
app.use(cors()); 

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Agents API',
      description: 'Agents API Information',
      contact: {
        name: 'Developer'
      },
      servers: [`http://157.245.4.204:3000`]
    }
  },
  apis: ['server.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Database connection
const pool = mariadb.createPool({
  host: 'localhost', // Replace with your database host 
  user: 'root', // Replace with your database user 
  password: '123456', // Replace with your database password 
  database: 'sample',
  connectionLimit: 5
});

// Middleware for JSON responses
app.use(express.json());

app.get('/say', async (req, res) => {
  const keyword = req.query.keyword;

  try {
    const response = await axios.get(`https://qzkjccf4w8.execute-api.us-east-1.amazonaws.com/staging/say?keyword=${keyword}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Lambda function:', error);
    res.status(500).send('Error in calling function');
  }
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: Retrieve all agents
 *     description: Fetch all agents from the database.
 *     responses:
 *       200:
 *         description: A list of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   AGENT_CODE:
 *                     type: string
 *                     description: Unique code for the agent.
 *                   AGENT_NAME:
 *                     type: string
 *                     description: Name of the agent.
 *                   WORKING_AREA:
 *                     type: string
 *                     description: Area where the agent works.
 *                   COMMISSION:
 *                     type: number
 *                     description: Commission rate of the agent.
 *                   PHONE_NO:
 *                     type: string
 *                     description: Contact number of the agent.
 *                   COUNTRY:
 *                     type: string
 *                     description: Country where the agent operates.
 *       500:
 *         description: Server error
 */

// GET request to retrieve all agents

app.get('/agents', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM agents');
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /agents/{code}:
 *   get:
 *     summary: Retrieve a specific agent
 *     description: Get an agent by their AGENT_CODE.
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: Unique AGENT_CODE of the agent.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A specific agent object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 AGENT_CODE:
 *                   type: string
 *                   description: Unique code for the agent.
 *                 AGENT_NAME:
 *                   type: string
 *                   description: Name of the agent.
 *                 WORKING_AREA:
 *                   type: string
 *                   description: Area where the agent works.
 *                 COMMISSION:
 *                   type: number
 *                   description: Commission rate of the agent.
 *                 PHONE_NO:
 *                   type: string
 *                   description: Contact number of the agent.
 *                 COUNTRY:
 *                   type: string
 *                   description: Country where the agent operates.
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */

// GET request to retrieve a specific agent by AGENT_CODE

app.get('/agents/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const conn = await pool.getConnection();
    const row = await conn.query('SELECT * FROM agents WHERE AGENT_CODE = ?', [code]);
    conn.release();
    if (row.length > 0) {
      res.json(row[0]);
    } else {
      res.status(404).json({ message: 'Agent not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Retrieve all companies
 *     description: Fetch all companies from the database.
 *     responses:
 *       200:
 *         description: A list of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   COMPANY_ID:
 *                     type: string
 *                     description: Unique ID of the company.
 *                   COMPANY_NAME:
 *                     type: string
 *                     description: Name of the company.
 *                   COMPANY_CITY:
 *                     type: string
 *                     description: City where the company is located.
 *       500:
 *         description: Server error
 */

// GET request to retrieve all companies
app.get('/companies', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM company');
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//POST request to insert a new record into a table, such as the agents table.
/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: Insert a new agent
 *     description: Add a new agent to the database by providing the agent's details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agent_code
 *               - agent_name
 *               - working_area
 *               - commission
 *               - phone_no
 *               - country
 *             properties:
 *               agent_code:
 *                 type: string
 *                 description: Unique code for the agent.
 *               agent_name:
 *                 type: string
 *                 description: Name of the agent.
 *               working_area:
 *                 type: string
 *                 description: Area where the agent works.
 *               commission:
 *                 type: number
 *                 description: Commission percentage for the agent.
 *               phone_no:
 *                 type: string
 *                 description: Phone number of the agent.
 *               country:
 *                 type: string
 *                 description: Country where the agent is located.
 *     responses:
 *       201:
 *         description: Agent added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 agentId:
 *                   type: integer
 *                   description: ID of the newly inserted agent.
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Database error.
 */
app.post('/api/agents', async (req, res) => {
  const { agent_code, agent_name, working_area, commission, phone_no, country } = req.body;

  // Validation
  if (!agent_code || !agent_name || !working_area || !commission || !phone_no || !country) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO agents (AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY) VALUES (?, ?, ?, ?, ?, ?)',
      [agent_code, agent_name, working_area, commission, phone_no, country]
    );
    res.status(201).json({ message: 'Agent added successfully', agentId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

//PATCH Endpoint to update the commission for an agent.
/**
 * @swagger
 * /api/agents/{id}:
 *   patch:
 *     summary: Update agent commission
 *     description: Update the commission for a specific agent identified by AGENT_CODE.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique code of the agent to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commission
 *             properties:
 *               commission:
 *                 type: number
 *                 description: New commission percentage for the agent.
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *       400:
 *         description: Bad request, commission field is required.
 *       404:
 *         description: Agent not found.
 *       500:
 *         description: Database error.
 */
app.patch('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { commission } = req.body;

  if (!commission) {
    return res.status(400).json({ error: 'Commission field is required' });
  }

  try {
    const result = await pool.query('UPDATE agents SET COMMISSION = ? WHERE AGENT_CODE = ?', [commission, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.status(200).json({ message: 'Agent updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});


//PUT Endpoint to replace an entire agent record.
/**
 * @swagger
 * /api/agents/{id}:
 *   put:
 *     summary: Replace an entire agent record
 *     description: Replace the entire record of a specific agent identified by AGENT_CODE.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique code of the agent to replace.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agent_code
 *               - agent_name
 *               - working_area
 *               - commission
 *               - phone_no
 *               - country
 *             properties:
 *               agent_code:
 *                 type: string
 *                 description: Unique code for the agent.
 *               agent_name:
 *                 type: string
 *                 description: Name of the agent.
 *               working_area:
 *                 type: string
 *                 description: Area where the agent works.
 *               commission:
 *                 type: number
 *                 description: Commission percentage for the agent.
 *               phone_no:
 *                 type: string
 *                 description: Phone number of the agent.
 *               country:
 *                 type: string
 *                 description: Country where the agent is located.
 *     responses:
 *       200:
 *         description: Agent replaced successfully
 *       400:
 *         description: Bad request, all fields are required.
 *       404:
 *         description: Agent not found.
 *       500:
 *         description: Database error.
 */
app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { agent_code, agent_name, working_area, commission, phone_no, country } = req.body;

  // Validation
  if (!agent_code || !agent_name || !working_area || !commission || !phone_no || !country) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE agents SET AGENT_CODE = ?, AGENT_NAME = ?, WORKING_AREA = ?, COMMISSION = ?, PHONE_NO = ?, COUNTRY = ? WHERE AGENT_CODE = ?',
      [agent_code, agent_name, working_area, commission, phone_no, country, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.status(200).json({ message: 'Agent replaced successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

//DELETE Endpoint will delete a record by its ID.
/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     summary: Delete an agent record
 *     description: Delete a specific agent identified by AGENT_CODE.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique code of the agent to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent deleted successfully
 *       404:
 *         description: Agent not found.
 *       500:
 *         description: Database error.
 */
app.delete('/api/agents/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM agents WHERE AGENT_CODE = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

