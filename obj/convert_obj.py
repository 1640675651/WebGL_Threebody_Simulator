obj = open('sphere.obj','r')
vertexfile = open('vertex.txt','w')
normalfile = open('normal.txt','w')
vertexindexfile = open('vi.txt','w')
normalindexfile = open('ni.txt','w')

vertexfile.write('[')
normalfile.write('[')
vertexindexfile.write('[')
normalindexfile.write('[')

for line in obj:
    if line.startswith('v '):
        x,y,z = line.lstrip('v ').split()
        vertexfile.write(x+','+y+','+z+',')
        
    elif line.startswith('vn'):
        x,y,z = line.lstrip('vn ').split()
        normalfile.write(x+','+y+','+z+',')
        
    elif line.startswith('f'):
        p1,p2,p3 = line.lstrip('f ').split()
        p1 = p1.split('/')
        p2 = p2.split('/')
        p3 = p3.split('/')
        vertexindexfile.write(str(int(p1[0])-1)+','+str(int(p2[0])-1)+','+str(int(p3[0])-1)+',')
        normalindexfile.write(str(int(p1[2])-1)+','+str(int(p2[2])-1)+','+str(int(p3[2])-1)+',')

vertexfile.write(']')
normalfile.write(']')
vertexindexfile.write(']')
normalindexfile.write(']')

obj.close()
vertexfile.close()
normalfile.close()
vertexindexfile.close()
normalindexfile.close()

