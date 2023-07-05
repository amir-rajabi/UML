import numpy as np
import torch
import torch.nn.functional as F
from numpy import ndarray
from torch.autograd import Variable
from torch.nn import Module
from torch.utils.data import DataLoader

stop_flag = False

loss_func = [F.cross_entropy, F.multi_margin_loss, F.multilabel_soft_margin_loss,
        F.soft_margin_loss, F.l1_loss, F.smooth_l1_loss, F.poisson_nll_loss]

def accuracy(loss_nr, model: Module, loader: DataLoader, cuda: bool) -> (float, float):
    model.eval()
    losses = []
    correct = 0
    with torch.no_grad():
        for data, target in loader:
            if stop_flag:
                return -1,-1
            if cuda:
                data, target = data.cuda(), target.cuda()
            data, target = Variable(data), Variable(target)
            output = model(data)
            target_input = target
            if loss_nr > 1:
                target_input = F.one_hot(target,10)
            losses.append(loss_func[loss_nr](output, target_input).item())
            pred = output.data.max(1, keepdim=True)[1]
            correct += pred.eq(target.data.view_as(pred)).cpu().sum().item()
    eval_loss = float(np.nanmean(losses))
    return eval_loss, 100. * correct / len(loader.dataset)


def accuracy_per_class(model: Module, loader: DataLoader, cuda: bool) \
        -> ndarray:
    model.eval()
    n_classes = len(np.unique(loader.dataset.targets))
    correct = np.zeros(n_classes, dtype=np.int64)
    wrong = np.zeros(n_classes, dtype=np.int64)
    with torch.no_grad():
        for data, target in loader:
            if cuda:
                data, target = data.cuda(), target.cuda()
            data, target = Variable(data), Variable(target)
            output = model(data)
            preds = output.data.max(dim=1)[1].cpu().numpy().astype(np.int64)
            target = target.data.cpu().numpy().astype(np.int64)
            for label, pred in zip(target, preds):
                if label == pred:
                    correct[label] += 1
                else:
                    wrong[label] += 1
    assert correct.sum() + wrong.sum() == len(loader.dataset)
    return 100. * correct / (correct + wrong)

#is called through stop_training() by frontend in training.py
def stop_eval():
    global stop_flag
    stop_flag = True
