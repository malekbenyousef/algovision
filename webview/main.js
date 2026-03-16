const arrayContainer = document.querySelector('#array-visualizer');

window.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'updateData') {
        arrayContainer.innerHTML = ''; 
        findAndDrawArrays(message.ast);
    }
});


function findAndDrawArrays(ast) {
    const arraysFound = [];

    function searchForArrays(node) {
        if (!node || typeof node !== 'object') return;

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
