#include <Python.h>

static PyObject * test(PyObject *self, PyObject *args){
    const char *command;
    int sts;
    if(!PyArg_ParseTuple(args, "s", &command))
        return NULL;
    sts = system(command);
    return PyLong_FromLong(sts);
}

static PyObject * helloworld(PyObject *self){
    return Py_BuildValue("s", "Hello World.");
}

static get_perm_index(int[] perm, int[] cards, int n){
    int index = perm[0], prod = 1;
    for(int i = 1; i < n; i++){
        index += cards[i - 1] * prod * perm[i];
        prod *= cards[i - 1];
    }
    return index;
}

static int[][] permute_cards(int[] cards, int n){

}

static PyObject * get_edge_weight(PyObject *self, PyObject *args){
    const PyObject *cpd;
    const PyObject *cards;
    int x;


}

static char bn_edge_weights_doc[] = "test(): test it. helloworld(): helloworld";

static PyMethodDef bn_edge_weights_methods[] = {
    {
        "test", test, METH_VARARGS, "test it"
    },
    {
        "helloworld", helloworld, METH_VARARGS, "hello world"
    },
    {
        NULL, NULL, 0, NULL
    }
};

static struct PyModuleDef bn_edge_weights_module = {
    PyModuleDef_HEAD_INIT,
    "bn_edge_weights",
    bn_edge_weights_doc,
    -1,
    bn_edge_weights_methods
};

PyMODINIT_FUNC PyInit_bn_edge_weights(void){
    return PyModule_Create(&bn_edge_weights_module);
}

int main(int argv, char* argc[]){
    /*Init the python interpreter */
    Py_Initialize();

    return 0;
}