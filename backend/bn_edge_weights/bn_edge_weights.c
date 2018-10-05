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

int * parse_int_list(PyObject *list){
    const int len = PyObject_Length(list);
    if(len == 0)
        return NULL;
    int i;
    int *array = (int*) malloc(sizeof(int) * len);
    for(i = 0; i < len; i++){
        PyObject *item = PyList_GetItem(list, i);
        array[i] = (int) PyLong_AsLong(item);
    }
    return array;
}

void get_2d_list_size(PyObject *list, int *n, int *m){
    *n = PyObject_Length(list);
    if(*n == 0){
        *m = 0;
        return;
    }
    *m = PyObject_Length(PyList_GetItem(list, 0));
}

PyObject * parse_2d_double_list(PyObject *list){
    const int n = PyObject_Length(list);
    if(n == 0)
        return Py_BuildValue("z", NULL);
    double **array = (double **) malloc(sizeof(double *) * n);
    PyObject *first_item = PyList_GetItem(list , 0);
    const int m = PyObject_Length(first_item);
    if(m == 0)
        return array;

    int i, j;
    for(i = 0; i < n; i++){
        PyObject *sub_list = PyList_GetItem(list, i);
        array[i] = (double *) malloc(sizeof(double) * m);
        for(j = 0; j < m; j++){
            PyObject *item = PyList_GetItem(sub_list, j);
            array[i][j] = PyFloat_AsDouble(item);
        }
    }
    return array;
}

void free_2d_double_array(double ** array, int n){
    int i;
    for(i = 0; i < n; i++){
        free(array[i]);
    }
    free(array);
}

PyObject * perms2list(int **perms, int perm_size, int n){
    int i, j;
    PyObject *list = PyList_New(perm_size);
    Py_INCREF(list);
    for(i = 0; i < perm_size; i++){
        PyObject *perm_list = PyList_New(n);
        Py_INCREF(perm_list);
        for(j = 0; j < n; j++){
            PyList_SetItem(perm_list, j, Py_BuildValue("i", perms[i][j]));
        }
        PyList_SetItem(list, i, perm_list);
    }
    return list;
}

PyObject * int_array2list(int *array, int len){
    PyObject *list = PyList_New(len);
    Py_INCREF(list);
    int i;
    for(i = 0; i < len; i++){
        PyList_SetItem(list, i, Py_BuildValue("i", array[i]));
    }
    return list;
}

PyObject * n2d_double_array2list(double **array, int n, int m){
    PyObject *list = PyList_New(n);
    Py_INCREF(list);
    int i, j;
    for(i = 0; i < n; i++){
        PyObject *sub_list = PyList_New(m);
        for(j = 0; j < m; j++){
            PyList_SetItem(sub_list, j, Py_BuildValue("d", array[i][j]));
        }
        PyList_SetItem(list, i, sub_list);
    }
    return list;
}

static PyObject * get_edge_weight(PyObject *self, PyObject *args){
    PyObject *cpd_obj;
    PyObject *cards_obj;
    PyObject *priors_obj;
    int x;
    if(!PyArg_ParseTuple(args, "iOOO", &x, &cpd_obj, &cards_obj, &priors_obj)){
        return NULL;
    }
    double **cpd = parse_2d_double_list(cpd_obj);
    int *cards = parse_int_list(cards_obj);
    double **priors = parse_2d_double_list(priors_obj);

    int n, m;
    get_2d_list_size(cpd_obj, &n, &m);

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
