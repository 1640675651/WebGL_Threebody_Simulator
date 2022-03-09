vertexfile = open('vertex.txt','r')
normalfile = open('normal.txt','r')
vertexindexfile = open('vi.txt','r')
normalindexfile = open('ni.txt','r')

fullvertexfile = open('fv.txt','w')
fullnormalfile = open('fn.txt','w')

vertices = eval(vertexfile.read())
normals = eval(normalfile.read())
vi = eval(vertexindexfile.read())
ni = eval(normalindexfile.read())

vertices_full = [0]*len(vi)*3
normals_full = [0]*len(ni)*3

for i in range(len(vi)): #we assume len(vi) = len(ni)
    vertices_full[i*3] = vertices[vi[i]*3] #x
    vertices_full[i*3+1] = vertices[vi[i]*3+1] #y
    vertices_full[i*3+2] = vertices[vi[i]*3+2] #z

    normals_full[i*3] = normals[ni[i]*3] #x
    normals_full[i*3+1] = normals[ni[i]*3+1] #y
    normals_full[i*3+2] = normals[ni[i]*3+2] #z

fullvertexfile.write(str(vertices_full))
fullnormalfile.write(str(normals_full))

vertexfile.close()
normalfile.close()
vertexindexfile.close()
normalindexfile.close()

fullvertexfile.close()
fullnormalfile.close()
