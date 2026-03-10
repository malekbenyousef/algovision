let network = null;
const container = document.getElementById('mynetwork');
const arrayContainer = document.getElementById('array-visualizer');

window.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'updateData') {
        container.innerHTML = ''; 
        arrayContainer.innerHTML = ''; 
        
        //drawGraph(message.ast);
        findAndDrawArrays(message.ast);
    }
});

function drawGraph(ast) {
    const nodes = new vis.DataSet([]);
    const edges = new vis.DataSet([]);
    let nodeIdCounter = 0;

    function traverse(node, parentId = null) {
        if (!node || typeof node !== 'object') return;

        if (Array.isArray(node)) {
            node.forEach(child => traverse(child, parentId));
            return;
        }

        if (node.type) {
            const currentId = nodeIdCounter++;
            
            let label = node.type;
            if (node.name) label += '\n(' + node.name + ')';
            if (node.operator) label += '\n[' + node.operator + ']';
            if (node.value !== undefined) label += '\n=' + node.value;

            nodes.add({ 
                id: currentId, 
                label: label, 
                shape: 'box',
                color: { background: '#0e639c', border: '#1177bb' },
                font: { color: 'white' }
            });

            if (parentId !== null) {
                edges.add({ from: parentId, to: currentId, arrows: 'to' });
            }

            for (let key in node) {
                if (key !== 'type' && key !== 'start' && key !== 'end') {
                    traverse(node[key], currentId);
                }
            }
        }
    }

    traverse(ast);

    const data = { nodes: nodes, edges: edges };
    const options = {
        layout: { hierarchical: { direction: 'UD', sortMethod: 'directed' } },
        physics: false 
    };

    network = new vis.Network(container, data, options);
}

function findAndDrawArrays(ast) {
    const arraysFound = [];

    function searchForArrays(node) {
        if (!node || typeof node !== 'object') return;

        if (Array.isArray(node)) {
            node.forEach(searchForArrays);
            return;
        }

        if (node.type === 'VariableDeclarator' && node.init && node.init.type === 'ArrayExpression') {
            const arrName = node.id.name;
            const elements = node.init.elements.map(el => {
                if (!el) return 'null'; 
                if (el.type === 'Literal') return el.value;
                if (el.type === 'Identifier') return el.name;
                return '[Expr]'; 
            });
            arraysFound.push({ name: arrName, elements: elements });
        }

        for (let key in node) {
            if (key !== 'type' && key !== 'start' && key !== 'end') {
                searchForArrays(node[key]);
            }
        }
    }

    searchForArrays(ast);

    if (arraysFound.length === 0) {
        arrayContainer.innerHTML = '<span style="color: #666; font-style: italic;">No static arrays detected in the code.</span>';
        return;
    }

    arraysFound.forEach(arr => {
        const wrapDiv = document.createElement('div');
        wrapDiv.className = 'array-container';

        let tableHtml = `<h4>${arr.name}</h4><table class="array-table"><tr>`;
        
        arr.elements.forEach((_, index) => {
            tableHtml += `<th>${index}</th>`;
        });
        tableHtml += '</tr><tr>';
        
        arr.elements.forEach(val => {
            tableHtml += `<td>${val}</td>`;
        });
        tableHtml += '</tr></table>';

        wrapDiv.innerHTML = tableHtml;
        arrayContainer.appendChild(wrapDiv);
    });
}