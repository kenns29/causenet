#include <Python.h>
#include <math.h>

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

void free_2d_double_array(double ** array, int n){
    if(array != NULL){
        int i;
        for(i = 0; i < n; i++){
            free(array[i]);
        }
        free(array);
    }
}

void free_2d_int_array(int ** array, int n){
    if(array != NULL){
        int i;
        for(i = 0; i < n; i++){
            free(array[i]);
        }
        free(array);
    }
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

double estimate_mutual_info(
    int x,  // the index of x of the edge (x, y)
    double **cpd,
    int cpd_n,
    int cpd_m,
    int *cards,
    int cards_len,
    double *pr_x // the prior probabilities of x
    ){

    int i, j, k;

    // the cardinality array excluding the x
    int yp_cards[cards_len - 1];
    for(i = 0, j = 0; i < cards_len; i++)
        if(i != x)
            yp_cards[j++] = cards[i];

    // the mapping from original evidence index to the index of evidence array excluding x
    int ei2ypi[cards_len];
    for(i = 0, j = 0; i < cards_len; i++)
        ei2ypi[i] = i != x ? j++ : -1;

    // the mapping vice versa
    int ypi2ei[cards_len - 1];
    for(i = 0, j = 0; i < cards_len; i++)
        if(i != x)
            ypi2ei[j++] = i;

    // obtain the permutations of variable assignments excluding x
    int yp_perm_size = get_perm_size(yp_cards, cards_len - 1);
    int **yp_perms = permute_cards(yp_cards, cards_len - 1, yp_perm_size);

    double weight = 0;
    int yp_perm_i = 0;
    do {
        // obtain the estimated prior probability of the permutation
        int prz = 1;
        if(yp_perm_size > 0){
            int e;
            for(e = 0; e < cards_len - 1; e++){
                if(e != x)
                    prz *= yp_perms[yp_perm_i][e];
            }
        }

        // the original permutation, the variable assignment of in the original cpd given the current z and x
        int perm[cards_len];
        for(i = 0; yp_perm_size > 0 && i < cards_len; i++)
            perm[i] = i != x ? yp_perms[yp_perm_i][ei2ypi[i]] : -1;

        // cardinality of x
        int x_card = cards[x];

        // the mapping from the x value to the permutation index
        int x2pi[x_card];
        for(i = 0; i < x_card; i++){
            perm[x] = i;
            x2pi[i] = get_perm_index(perm, cards, cards_len);
        }

        // the mapping from the y value to P(y | z);
        double y2py_z[cpd_n];
        for(i = 0; i < cpd_n; i++){
            // the marginal probability of P(y | z)
            double py_z = 0;
            for(k = 0; k < x_card; k++)
                py_z += cpd[i][x2pi[k]];
            y2py_z[i] = py_z / x_card;
        }


        // obtain a piece of the the mutual info
        double ppp = 0;
        for(k = 0; k < x_card; k++){
            double pp = 0;
            for(i = 0; i < cpd_n; i++){
                double p = cpd[i][x2pi[k]];
                pp += p * log(p / y2py_z[i]);
            }
            ppp += pr_x[k] * pp;
        }

        weight += prz * ppp;
        ++yp_perm_i;
    } while(yp_perm_i < yp_perm_size);

    free_2d_int_array(yp_perms, yp_perm_size);
    return weight;
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

double ** parse_2d_double_list(PyObject *list){
    const int n = PyObject_Length(list);
    if(n == 0)
        return NULL;
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

    int cpd_n, cpd_m, pr_n, pr_m;
    get_2d_list_size(cpd_obj, &cpd_n, &cpd_m);
    get_2d_list_size(priors_obj, &pr_n, &pr_m);

    int cards_len = PyObject_Length(cards_obj);

    double weight = estimate_mutual_info(x, cpd, cpd_n, cpd_m, cards, cards_len, priors[x]);

    free(cards);
    free_2d_double_array(cpd, cpd_n);
    free_2d_double_array(priors, pr_n);

    return PyFloat_FromDouble(weight);
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
