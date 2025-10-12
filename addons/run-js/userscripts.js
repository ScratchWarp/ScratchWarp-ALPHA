function getProjectIdFromPath(path) {
    // Example path: /projects/12345678/editor or /projects/12345678/
    const match = path.match(/^\/projects\/([^\/]+)\//);
    return match ? match[1] : null;
}
async function isProjectAllowed(projectId) {
    const response = await fetch('https://ScratchWarp.github.io/runjs-projects.txt');
    const text = await response.text();
    return text.split('\n').map(line => line.trim()).includes(projectId);
}
function execSandboxed(jsCode) {
    // Example using an iframe sandbox (basic, not fully secure):
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentWindow.eval(jsCode);
    // Remove iframe after execution, as needed
    document.body.removeChild(iframe);
}

async function handleProjectJS(path, jsCode) {
    const projectId = getProjectIdFromPath(path);
    if (!projectId) return;

    const allowed = await isProjectAllowed(projectId);
    if (allowed) {
        execSandboxed(jsCode);
    } else {
        if (confirm("This project is trying to run javascript. Run it?")) {
            execSandboxed(jsCode);
        } else {
            alert("JavaScript execution cancelled.");
        }
    }
}


export default async function ({ addon, console, msg }) {
  const vm = addon.tab.traps.vm;
  // Assume `vm` is an instance of Scratch VM
  const target = vm.runtime.getTargetForStage(); // or getTargetById(spriteId)
  const variableId = target.lookupVariableByNameAndType('RunJavaScript').id;
  const value = target.variables[variableId].value;
  const currentPath = window.location.pathname;
  handleProjectJS(currentPath, value)
