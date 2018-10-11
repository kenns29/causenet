#include <Python.h>
#include <math.h>

void free_2d_double_array(double ** array, int n){
    if(array != NULL){
        int i;
        for(i = 0; i < n; i++){
            if(array[i] != NULL)
                free(array[i]);
        }
        free(array);
    }
}

int get_perm_index(int perm[], int cards[], int n){
    int i, index = perm[0], prod = 1;
    for(i = 1; i < n; i++){
        index += cards[i - 1] * prod * perm[i];
        prod *= cards[i - 1];
    }
    return index;
}

int get_perm_size(int cards[], int n){
    if(n == 0)
        return 0;
    int i, size = 1;
    for(i = 0; i < n; i++)
        size *= cards[i];
    return size;
}

void permute_cards_recurse(
    int cards[],
    int n,
    int i,
    int stack[],
    int *s,
    int *order,
    void (*callback)(int[], int, int, void*),
    void *callback_args){

    int k;
    if(i >= n){
        int perm[n];
        for(k = 0; k < n; k++){
            perm[k] = stack[n - k - 1];
        }
        callback(perm, n, *order, callback_args);
        ++(*order);
        return;
    }
    int c = cards[n - i - 1];
    for(k = 0; k < c; k++){
        stack[(*s)++] = k;
        permute_cards_recurse(cards, n, i + 1, stack, s, order, callback, callback_args);
        --(*s);
    }
}

void permute_cards(int cards[], int n, void (*callback)(int[], int, int, void*), void *callback_args){
    if(n == 0)
        return;
    int stack[n];
    int s = 0, order = 0;

    permute_cards_recurse(cards, n, 0, stack, &s, &order, callback, callback_args);
}

struct GetEdgeWeightsPermuteArgs{
    int x;
    double *cpd;
    int cpd_n;
    int cpd_m;
    int *cards;
    int cards_len;
    double **priors;

    int *ei2ypi;
    int *ypi2ei;
    int yp_perm_size;

    double weight;
};

void estimate_mutual_info_each_perm(int yp_perm[], int n, int order, void *args){
    struct GetEdgeWeightsPermuteArgs *permute_args = (struct GetEdgeWeightsPermuteArgs*) args;

    int x = permute_args->x;
    double *cpd = permute_args->cpd;
    int cpd_n = permute_args->cpd_n;
    int cpd_m = permute_args->cpd_m;
    int *cards = permute_args->cards;
    int cards_len = permute_args->cards_len;
    double **priors = permute_args->priors;

    int *ei2ypi = permute_args->ei2ypi;
    int *ypi2ei = permute_args->ypi2ei;
    int yp_perm_size = permute_args->yp_perm_size;

    int i, k;

     // obtain the estimated prior probability of the permutation
    double prz = 1;
    if(yp_perm_size > 0){
        for(i = 0; i < cards_len - 1; i++){
            int ei = ypi2ei[i];
            int v = yp_perm[i];
            prz *= priors[ei][v];
        }
    }

    // the original permutation, the variable assignment of in the original cpd given the current z and x
    int perm[cards_len];
    if(yp_perm_size > 0)
        for(i = 0; i < cards_len; i++)
            perm[i] = i != x ? yp_perm[ei2ypi[i]] : -1;

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
            py_z += *(cpd + i * cpd_m + x2pi[k]);
        y2py_z[i] = py_z / x_card;
    }

    // obtain a piece of the the mutual info
    double ppp = 0;
    for(k = 0; k < x_card; k++){
        double pp = 0;
        for(i = 0; i < cpd_n; i++){
            double p = *(cpd + i * cpd_m + x2pi[k]);
            pp += p * log(p / y2py_z[i]);
        }
        ppp += priors[x][k] * pp;
    }

    permute_args->weight += prz * ppp;
}

double estimate_mutual_info(
    int x,  // the index of x of the edge (x, y)
    double *cpd,
    int cpd_n,
    int cpd_m,
    int cards[],
    int cards_len,
    double **priors // the prior probabilities
    ){

    int i, j;

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

    // permute arguments
    struct GetEdgeWeightsPermuteArgs permute_args;

    permute_args.x = x;
    permute_args.cpd = cpd;
    permute_args.cpd_n = cpd_n;
    permute_args.cpd_m = cpd_m;
    permute_args.cards = cards;
    permute_args.cards_len = cards_len;
    permute_args.priors = priors;

    permute_args.ei2ypi = ei2ypi;
    permute_args.ypi2ei = ypi2ei;
    permute_args.yp_perm_size = get_perm_size(yp_cards, cards_len - 1);
    permute_args.weight = 0;

    if(permute_args.yp_perm_size == 0)
        estimate_mutual_info_each_perm(yp_cards, cards_len - 1, 0, &permute_args);
    else
        // permute each variable assignment excluding x
        permute_cards(yp_cards, cards_len - 1, estimate_mutual_info_each_perm, &permute_args);

    return permute_args.weight;
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
    int i, j;
    for(i = 0; i < n; i++){
        PyObject *sub_list = PyList_GetItem(list, i);
        const int m = PyObject_Length(sub_list);
        if(m > 0){
            array[i] = (double *) malloc(sizeof(double) * m);
            for(j = 0; j < m; j++){
                PyObject *item = PyList_GetItem(sub_list, j);
                array[i][j] = PyFloat_AsDouble(item);
            }
        } else {
            array[i] = NULL;
        }
    }
    return array;
}

double * parse_2d_eq_size_item_double_list(PyObject *list){
    const int n = PyObject_Length(list);
    if(n == 0)
        return NULL;
    PyObject *first_item = PyList_GetItem(list, 0);
    const int m = PyObject_Length(first_item);
    if(m == 0)
        return NULL;

    double *array = (double *) malloc(sizeof(double) * n * m);
    int i, j;
    for(i = 0; i < n; i++){
        PyObject *sub_list = PyList_GetItem(list, i);
        for(j = 0; j < m; j++){
            PyObject *item = PyList_GetItem(sub_list, j);
            *(array + i * m + j) = PyFloat_AsDouble(item);
        }
    }
    return array;
}

static PyObject * get_edge_weight(PyObject *self, PyObject *args){
    PyObject *cpd_obj;
    PyObject *cards_obj;
    PyObject *priors_obj;
    int x;
    if(!PyArg_ParseTuple(args, "iOOO", &x, &cpd_obj, &cards_obj, &priors_obj)){
        return NULL;
    }
    double *cpd = parse_2d_eq_size_item_double_list(cpd_obj);
    int *cards = parse_int_list(cards_obj);
    double **priors = parse_2d_double_list(priors_obj);

    int cards_len = PyObject_Length(cards_obj);
    int pr_n = PyObject_Length(priors_obj);

    int cpd_n, cpd_m;
    get_2d_list_size(cpd_obj, &cpd_n, &cpd_m);

    double weight = estimate_mutual_info(x, cpd, cpd_n, cpd_m, cards, cards_len, priors);

    free(cards);
    free(cpd);
    free_2d_double_array(priors, pr_n);

    return PyFloat_FromDouble(weight);
}

struct GetCardsPermutationPermuteArgs {
    PyObject *perm_list;
};

void get_cards_permutation_callback(int perms[], int n, int order, void *args){
    struct GetCardsPermutationPermuteArgs *permute_args = (struct GetCardsPermutationPermuteArgs*) args;
    PyObject *perm_list = permute_args->perm_list;
    PyObject *perm_tuple = PyTuple_New(n);

    int i;
    for(i = 0; i < n; i++){
        PyTuple_SetItem(perm_tuple, i, Py_BuildValue("i", perms[i]));
    }
    PyList_SetItem(perm_list, order, perm_tuple);
}

static PyObject * get_cards_permutation(PyObject *self, PyObject *args){
    PyObject *cards_obj;
    if(!PyArg_ParseTuple(args, "O", &cards_obj)){
        return NULL;
    }
    int *cards = parse_int_list(cards_obj);
    int cards_len = PyObject_Length(cards_obj);
    int perm_size = get_perm_size(cards, cards_len);

    struct GetCardsPermutationPermuteArgs permute_args;

    permute_args.perm_list = PyList_New(perm_size);
    Py_INCREF(permute_args.perm_list);

    permute_cards(cards, cards_len, get_cards_permutation_callback, &permute_args);

    free(cards);
    
    return permute_args.perm_list;
}

static char bn_edge_weights_doc[] = "";

static PyMethodDef bn_edge_weights_methods[] = {
    {
        "get_cards_permutation", get_cards_permutation, METH_VARARGS, "get cardinality permutations"
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
