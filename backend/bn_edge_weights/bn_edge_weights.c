#include <Python.h>

static PyObject * test(PyObject *self, PyObject *args){
    const char *command;
    int sts;
    if(!PyArg_ParseTuple(args, "s", &command))
        return NULL;
    sts = system(command);
    return PyLong_FromLong(sts);
}

static PyObject * helloworld(PyObject *self, PyObject *args){
    return Py_BuildValue("s", "Hello World.");
}

int get_perm_index(int *perm, int *cards, int n){
    int i, index = perm[0], prod = 1;
    for(i = 1; i < n; i++){
        index += cards[i - 1] * prod * perm[i];
        prod *= cards[i - 1];
    }
    return index;
}

int get_perm_size(int *cards, int n){
    if(n == 0)
        return 0;
    int i, size = 1;
    for(i = 0; i < n; i++)
        size *= cards[i];
    return size;
}

void permute_cards_recurse(int *cards, int n, int i, int *stack, int *s, int **perms, int *order){
    int k;
    if(i >= n){
        for(k = 0; k < n; k++)
            perms[*order][k] = stack[n - k - 1];
        ++(*order);
        return;
    }
    int c = cards[n - i - 1];
    for(k = 0; k < c; k++){
        stack[(*s)++] = k;
        permute_cards_recurse(cards, n, i + 1, stack, s, perms, order);
        --(*s);
    }
}

int ** permute_cards(int *cards, int n, int perm_size){
    if(n == 0 || perm_size == 0)
        return NULL;
    int i;
    int rev_cards[n];
    for(i = 0; i < n; i++)
        rev_cards[n - i - 1] = cards[i];

    int stack[n];
    int s = 0, order = 0;

    int **perms = (int **) malloc(sizeof(int *) * perm_size);
    for(i = 0; i < perm_size; i++)
        perms[i] = (int *) malloc(sizeof(int) * n);
    permute_cards_recurse(cards, n, 0, stack, &s, perms, &order);
    return perms;
}

int * parse_int_list(PyObject * list){
    int i;
    const int len = PyObject_Length(list);
    int *array = (int*) malloc(sizeof(int) * len);
    for(i = 0; i < len; i++){
        PyObject *item = PyList_GetItem(list, i);
        array[i] = (int) PyLong_AsLong(item);
    }
    return array;
}


PyObject * perms2list(int **perms, int perm_size, int n){
    int i, j;
    PyObject *list = PyList_New(perm_size);
    for(i = 0; i < perm_size; i++){
        PyObject *perm_list = PyList_New(n);
        for(j = 0; j < n; j++){
            PyList_SetItem(perm_list, j, Py_BuildValue("i", perms[i][j]));
        }
        PyList_SetItem(list, i, perm_list);
    }
    return list;
}

PyObject * int_array2list(int *array, int len){
    PyObject *list = PyList_New(len);
    for(int i = 0; i < len; i++){
        PyList_SetItem(list, i, Py_BuildValue("i", array[i]));
    }
    return list;
}

static PyObject * get_edge_weight(PyObject *self, PyObject *args){
    PyObject *cpd_obj;
    PyObject *cards_obj;
    PyObject *priors_obj;
    int x, n;
    if(!PyArg_ParseTuple(args, "iOOO", &x, &cpd_obj, &cards_obj, &priors_obj)){
        return NULL;
    }
    int *cards = parse_int_list(cards_obj);
    int cards_len = PyObject_Length(cards_obj);
    int perm_size = get_perm_size(cards, cards_len);
    int **perms = permute_cards(cards, cards_len, perm_size);

    free(cards);

    return perms2list(perms, perm_size, cards_len);
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
        "get_edge_weight", get_edge_weight, METH_VARARGS, "get edge weight"
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
