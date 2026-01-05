const projects = []
let currentProject = null
let currentStack = null

const ui = {
  projects: document.getElementById('projects'),
  stacks: document.getElementById('stacks'),
  events: document.getElementById('events'),
  diagram: document.getElementById('diagram'),
  edges: document.getElementById('edges'),
  viewerTitle: document.getElementById('viewerTitle'),
  viewerContent: document.getElementById('viewerContent'),
  cli: document.getElementById('cliCommand'),
  zip: document.getElementById('zipDownload')
}

function registerProject(p) {
  p.state = {}
  p.stacks.forEach(s => p.state[s.id] = 'IDLE')
  projects.push(p)
}

registerProject({
  name: 'Test',
  base: 'Test',
  zip: 'test.zip',
  stacks: [
    {id:'root',label:'Root',file:'root.yaml',x:420,y:40},
    {id:'network',label:'Network',file:'stacks/network.yaml',x:120,y:180},
    {id:'security',label:'Security',file:'stacks/security.yaml',x:420,y:180},
    {id:'s3',label:'S3',file:'stacks/s3.yaml',x:720,y:180},
    {id:'alb',label:'ALB',file:'stacks/alb.yaml',x:320,y:340},
    {id:'ecs',label:'ECS',file:'stacks/ecs.yaml',x:620,y:340}
  ],
  edges: [
    ['root','network'],['root','security'],['root','s3'],
    ['network','alb'],['network','ecs'],['alb','ecs']
  ]
})

function log(msg) {
  const d = document.createElement('div')
  d.textContent = msg
  ui.events.appendChild(d)
  ui.events.scrollTop = ui.events.scrollHeight
}

function loadProjects() {
  ui.projects.innerHTML = ''
  projects.forEach(p => {
    const d = document.createElement('div')
    d.textContent = p.name
    d.onclick = () => selectProject(p)
    ui.projects.appendChild(d)
  })
}

async function selectProject(p) {
  currentProject = p
  ui.zip.href = `${p.base}/${p.zip}`
  renderStacks()
  renderDiagram()
}

function renderStacks() {
  ui.stacks.innerHTML = ''
  currentProject.stacks.forEach(s => {
    const d = document.createElement('div')
    d.textContent = s.label
    d.onclick = () => selectStack(s)
    ui.stacks.appendChild(d)
  })
}

async function selectStack(s) {
  currentStack = s
  ui.viewerTitle.textContent = `${currentProject.base}/${s.file}`
  ui.cli.textContent = `aws cloudformation deploy --template-file ${s.file}`
  const r = await fetch(`${currentProject.base}/${s.file}`)
  ui.viewerContent.textContent = r.ok ? await r.text() : 'File not found'
}

async function simulate(action) {
  ui.events.innerHTML = ''
  const order = action === 'deploy'
    ? currentProject.stacks
    : [...currentProject.stacks].reverse()

  for (const s of order) {
    log(`${action.toUpperCase()}_IN_PROGRESS ${s.label}`)
    await new Promise(r => setTimeout(r, 400))
    log(`${action.toUpperCase()}_COMPLETE ${s.label}`)
  }
}

document.getElementById('deployBtn').onclick = () => simulate('deploy')
document.getElementById('destroyBtn').onclick = () => simulate('delete')

loadProjects()
selectProject(projects[0])
